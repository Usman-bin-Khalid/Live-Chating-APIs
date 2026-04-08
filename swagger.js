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
        url: 'https://live-chating-apis.onrender.com',
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
    },
    paths: {
      '/auth/signup': {
        post: {
          summary: 'Register a new user',
          description: 'Create a new user account with username, email, and password',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'email', 'password'],
                  properties: {
                    username: {
                      type: 'string',
                      example: 'john_doe'
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'john@example.com'
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      example: 'securePassword123'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          username: { type: 'string' },
                          email: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Missing required fields or user already exists'
            }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'User login',
          description: 'Authenticate user with email and password, returns JWT token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'john@example.com'
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      example: 'securePassword123'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          username: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Invalid credentials'
            }
          }
        }
      },
      '/auth/profile': {
        put: {
          summary: 'Update user profile',
          description: 'Update user profile information (requires authentication)',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', example: 'john_doe_updated' },
                    email: { type: 'string', format: 'email', example: 'john.updated@example.com' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Profile updated successfully' },
            401: { description: 'Unauthorized - Invalid or missing token' }
          }
        }
      },
      '/auth/search': {
        get: {
          summary: 'Search for users',
          description: 'Search for users by username or email (case-insensitive)',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'The search query (username or email)'
            }
          ],
          responses: {
            200: {
              description: 'Users found successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/chat/inbox': {
        get: {
          summary: 'Get user inbox',
          description: 'Retrieve all conversations with latest message, unread count, and contact details (like WhatsApp main screen)',
          tags: ['Chat'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Inbox retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', description: 'Contact user ID' },
                        lastMessage: { type: 'string' },
                        timestamp: { type: 'string', format: 'date-time' },
                        unreadCount: { type: 'integer' },
                        contactDetails: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            username: { type: 'string' },
                            email: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized - Invalid or missing token' }
          }
        }
      },
      '/chat/messages/{otherUserId}': {
        get: {
          summary: 'Get messages between two users',
          description: 'Retrieve all messages exchanged between the current user and another user. Also marks incoming messages as read.',
          tags: ['Chat'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'otherUserId',
              required: true,
              schema: { type: 'string' },
              description: 'The ID of the other user in the conversation'
            }
          ],
          responses: {
            200: {
              description: 'Messages retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Message'
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized - Invalid or missing token' }
          }
        }
      },
      '/chat/send': {
        post: {
          summary: 'Send a message (HTTP)',
          description: 'Send a message to another user via REST API. Also triggers a Socket.io event to the receiver.',
          tags: ['Chat'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['receiver', 'text'],
                  properties: {
                    receiver: { type: 'string', example: '65f1234567890abcdef12345' },
                    text: { type: 'string', example: 'Hello from Swagger!' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Message sent successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Message'
                  }
                }
              }
            },
            400: { description: 'Missing required fields' },
            401: { description: 'Unauthorized' }
          }
        }
      }

    }
  },
  apis: []
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
