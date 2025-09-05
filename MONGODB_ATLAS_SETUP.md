# MongoDB Atlas Configuration for Akash Share

This document explains how to configure the Akash Share project to use MongoDB Atlas instead of a local MongoDB instance.

## Current Configuration

The project is now configured to use MongoDB Atlas with the following connection string:
```
mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/akashshare?retryWrites=true&w=majority
```

## Configuration File

The MongoDB connection is configured in `backend/.env`:
```env
MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/akashshare?retryWrites=true&w=majority
```

## Benefits of Using MongoDB Atlas

1. **Scalability**: Automatically scales to handle increased user load
2. **High Availability**: Built-in replication and failover
3. **Managed Service**: No need to maintain MongoDB servers
4. **Global Distribution**: Can be deployed in multiple regions
5. **Security**: Enterprise-grade security features

## Testing the Connection

To verify the MongoDB Atlas connection is working:

```bash
cd backend
node test-mongo-atlas.js
```

## Security Considerations

1. The connection string contains credentials and should be kept secure
2. For production deployments, consider using:
   - Environment variables
   - Secret management systems
   - IP whitelisting in MongoDB Atlas

## Troubleshooting

If you encounter connection issues:

1. Verify your internet connection
2. Check that the MongoDB Atlas cluster is running
3. Ensure your IP address is whitelisted in MongoDB Atlas
4. Verify the username and password are correct
5. Check that the connection string format is correct

## Reverting to Local MongoDB

To switch back to local MongoDB, update the `MONGO_URI` in `backend/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/akashshare
```