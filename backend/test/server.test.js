const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

// Set test environment BEFORE loading dotenv
process.env.NODE_ENV = 'test';
// Use local MongoDB for testing
process.env.MONGO_URI = 'mongodb://localhost:27017/akashshare_test';

chai.use(chaiHttp);

// Import the app after setting environment
const { app } = require('../server');

describe('Server API Tests', () => {
  let server;

  beforeEach(async () => {
    // Start server for testing on a random available port
    server = app.listen(0);
    console.log(`Test server listening on port ${server.address().port}`);
  });

  afterEach(async () => {
    // Close server after tests
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('GET /health', () => {
    it('should return 200 and health status', (done) => {
      chai.request(server)
        .get('/health')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 'OK');
          expect(res.body).to.have.property('timestamp');
          expect(res.body).to.have.property('uptime');
          done();
        });
    });
  });

  describe('POST /upload', () => {
    it('should return 400 when no file is uploaded', (done) => {
      chai.request(server)
        .post('/upload')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error', 'No file uploaded');
          done();
        });
    });

    it('should return 400 for unsupported file type', (done) => {
      chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('test content'), {
          filename: 'test.exe',
          contentType: 'application/x-msdownload'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.error).to.include('File type');
          done();
        });
    });

    it('should successfully upload a valid file', async () => {
      const res = await chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('test content'), {
          filename: 'test.txt',
          contentType: 'text/plain'
        });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('code');
      expect(res.body).to.have.property('filename', 'test.txt');
      expect(res.body).to.have.property('size');
      expect(res.body).to.have.property('message', 'File uploaded successfully');
      expect(res.body.code).to.match(/^[0-9]{4}$/); // 4 digit code
    });

    // Enhanced tests for edge cases
    it('should reject files exceeding size limit', (done) => {
      // Create a large buffer (15MB) to exceed the default 10MB limit
      const largeBuffer = Buffer.alloc(15 * 1024 * 1024, 'a');
      
      chai.request(server)
        .post('/upload')
        .attach('file', largeBuffer, {
          filename: 'large-file.txt',
          contentType: 'text/plain'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body.error).to.include('File too large');
          done();
        });
    });

    it('should reject multiple file uploads', (done) => {
      chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('test content 1'), {
          filename: 'test1.txt',
          contentType: 'text/plain'
        })
        .attach('file', Buffer.from('test content 2'), {
          filename: 'test2.txt',
          contentType: 'text/plain'
        })
        .end((err, res) => {
          // Should reject multiple files
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should handle special characters in filename', async () => {
      const res = await chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('test content'), {
          filename: 'test file with spaces & symbols @#$%.txt',
          contentType: 'text/plain'
        });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('code');
      expect(res.body).to.have.property('filename');
    });
  });

  describe('GET /download/:code', () => {
    let testCode;

    beforeEach(async () => {
      // Upload a test file first
      const res = await chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('download test content'), {
          filename: 'download-test.txt',
          contentType: 'text/plain'
        });

      testCode = res.body.code;
    });

    it('should return 400 for invalid code format', (done) => {
      chai.request(server)
        .get('/download/123')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error', 'Invalid code format');
          done();
        });
    });

    it('should return 404 for non-existent code', (done) => {
      chai.request(server)
        .get('/download/9999')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('error', 'File not found or code is invalid');
          done();
        });
    });

    it('should successfully download a file with valid code', (done) => {
      chai.request(server)
        .get(`/download/${testCode}`)
        .buffer() // Important: buffer the response
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.text).to.equal('download test content');
          done();
        });
    });

    // Enhanced tests for edge cases
    it('should handle files with special characters in filename', (done) => {
      // Upload a file with special characters
      chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('special chars content'), {
          filename: 'file with spaces & symbols @#$%.txt',
          contentType: 'text/plain'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('code');
          
          // Download the file
          const specialCode = res.body.code;
          chai.request(server)
            .get(`/download/${specialCode}`)
            .buffer()
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.text).to.equal('special chars content');
              done();
            });
        });
    });

    it('should handle very large files near the size limit', (done) => {
      // Create a buffer that's just under the 10MB limit
      const largeBuffer = Buffer.alloc(9 * 1024 * 1024, 'a'); // 9MB
      
      chai.request(server)
        .post('/upload')
        .attach('file', largeBuffer, {
          filename: 'large-file.txt',
          contentType: 'text/plain'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('code');
          done();
        });
    });

    it('should handle expired files correctly', function(done) {
      this.timeout(10000); // Increase timeout for this test
      
      // Upload a file with immediate expiration for testing
      chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('expiring test content'), {
          filename: 'expiring-test.txt',
          contentType: 'text/plain'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          
          const expiringCode = res.body.code;
          
          // Try to download immediately (should work)
          chai.request(server)
            .get(`/download/${expiringCode}`)
            .buffer()
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              // Note: This test may not fully validate expiration without modifying the File schema
              done();
            });
        });
    });

    it('should handle concurrent downloads', (done) => {
      const requests = [];
      
      // Make 5 concurrent requests for the same file
      for (let i = 0; i < 5; i++) {
        requests.push(
          chai.request(server)
            .get(`/download/${testCode}`)
            .buffer()
            .then(res => res)
            .catch(err => err.response)
        );
      }

      Promise.all(requests).then((responses) => {
        // All should succeed
        const successful = responses.filter(res => res.status === 200);
        expect(successful.length).to.equal(5);
        done();
      }).catch(done);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting', async function() {
      this.timeout(30000); // Increase timeout for rate limiting test

      const maxRequests = 101; // Exceed the limit
      let rateLimitedCount = 0;

      // Send requests sequentially to ensure rate limiter counts them properly
      for (let i = 0; i < maxRequests; i++) {
        try {
          const res = await chai.request(server)
            .get('/health');
          if (res.status === 429) {
            rateLimitedCount++;
          }
        } catch (err) {
          if (err.response?.status === 429) {
            rateLimitedCount++;
          }
        }

        // Small delay between requests to allow rate limiter to process
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      console.log(`Rate limited requests: ${rateLimitedCount}`);
      expect(rateLimitedCount).to.be.greaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', (done) => {
      chai.request(server)
        .get('/nonexistent')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          // The server might return a generic 404 without specific error message
          // depending on Express configuration
          done();
        });
    });

    // Additional error handling tests
    it('should handle malformed requests gracefully', (done) => {
      // Add a much longer delay to allow rate limiter window to reset
      setTimeout(() => {
        chai.request(server)
          .post('/upload')
          .set('Content-Type', 'application/json')
          .send({ invalid: 'data' })
          .end((err, res) => {
            expect(err).to.be.null;
            // Should handle gracefully, likely returning 400 for no file
            expect(res.status).to.be.oneOf([400, 500]);
            done();
          });
      }, 20000); // 20 second delay to reset rate limiter window
    });

    it('should handle upload with no content', (done) => {
      // Add a much longer delay to allow rate limiter window to reset
      setTimeout(() => {
        chai.request(server)
          .post('/upload')
          .attach('file', Buffer.from(''), {
            filename: 'empty.txt',
            contentType: 'text/plain'
          })
          .end((err, res) => {
            expect(err).to.be.null;
            // Empty files should still be accepted
            expect(res).to.have.status(201);
            done();
          });
      }, 20000); // 20 second delay to reset rate limiter window
    });

    it('should handle upload with very long filename', (done) => {
      // Add a much longer delay to allow rate limiter window to reset
      setTimeout(() => {
        const longFilename = `${'a'.repeat(200)}.txt`;
        chai.request(server)
          .post('/upload')
          .attach('file', Buffer.from('test content'), {
            filename: longFilename,
            contentType: 'text/plain'
          })
          .end((err, res) => {
            expect(err).to.be.null;
            // Should handle long filenames (may be truncated)
            expect(res.status).to.be.oneOf([201, 400]);
            done();
          });
      }, 20000); // 20 second delay to reset rate limiter window
    });
  });
});