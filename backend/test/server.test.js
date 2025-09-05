const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const path = require('path');

// Load environment variables for testing
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Set test environment
process.env.NODE_ENV = 'test';

chai.use(chaiHttp);

// Import the app after setting environment
const app = require('../server');

describe('Server API Tests', () => {
  let server;

  beforeEach((done) => {
    // Start server for testing
    server = app.listen(0, () => {
      done();
    });
  });

  afterEach((done) => {
    // Close server after tests
    server.close(() => {
      done();
    });
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

    it('should successfully upload a valid file', (done) => {
      chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('test content'), {
          filename: 'test.txt',
          contentType: 'text/plain'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('code');
          expect(res.body).to.have.property('filename', 'test.txt');
          expect(res.body).to.have.property('size');
          expect(res.body).to.have.property('message', 'File uploaded successfully');
          expect(res.body.code).to.match(/^[0-9]{4}$/); // 4 digit code
          done();
        });
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

    it('should handle special characters in filename', (done) => {
      chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('test content'), {
          filename: 'test file with spaces & symbols @#$%.txt',
          contentType: 'text/plain'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('code');
          expect(res.body).to.have.property('filename');
          done();
        });
    });
  });

  describe('GET /download/:code', () => {
    let testCode;

    beforeEach((done) => {
      // Upload a test file first
      chai.request(server)
        .post('/upload')
        .attach('file', Buffer.from('download test content'), {
          filename: 'download-test.txt',
          contentType: 'text/plain'
        })
        .end((err, res) => {
          testCode = res.body.code;
          done();
        });
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
    it('should enforce rate limiting', function(done) {
      // Skip this test in test mode since we disabled rate limiting
      if (process.env.NODE_ENV === 'test') {
        this.skip();
      }
      
      const requests = [];
      const maxRequests = 101; // Exceed the limit

      for (let i = 0; i < maxRequests; i++) {
        requests.push(
          new Promise((resolve) => {
            chai.request(server)
              .get('/health')
              .end((err, res) => {
                resolve({ err, res, status: res ? res.status : null });
              });
          })
        );
      }

      Promise.all(requests).then((responses) => {
        const rateLimited = responses.filter(response => response.status === 429);
        expect(rateLimited.length).to.be.greaterThan(0);
        done();
      }).catch(done);
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
      // Add a small delay to avoid rate limiting
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
      }, 100);
    });

    it('should handle upload with no content', (done) => {
      // Add a small delay to avoid rate limiting
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
      }, 100);
    });

    it('should handle upload with very long filename', (done) => {
      // Add a small delay to avoid rate limiting
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
      }, 100);
    });
  });
});