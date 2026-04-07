const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Live Chatting APIs',
      version: '1.0.0',
      description: 'A real-time chatting API with Socket.io integration, user authentication, and message management.',
      contact: {
        name: 'Support Team',
        email: 'support@livechatting.com'
      }
    },
    servers: [
      {
        url: 'https://live-chatting-apis.onrender.com',
        description: 'Production Server'
      },
      {
        url: 'http://localhost:8080',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              description: 'Email address'
            },
            password: {
              type: 'string',
              description: 'Password (hashed)'
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Message ID'
            },
            sender: {
              type: 'string',
              description: 'Sender user ID'
            },
            receiver: {
              type: 'string',
              description: 'Receiver user ID'
            },
            text: {
              type: 'string',
              description: 'Message content'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Message creation timestamp'
            }
          }
        }
      }
    }
  },
  apis: [
    './routes/authRoutes.js',
    './routes/chatRoutes.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
