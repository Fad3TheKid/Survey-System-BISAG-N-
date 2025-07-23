const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Assuming server.js exports the express app
const User = require('../models/User');

beforeAll(async () => {
  // Connect to a test database
  const url = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1/formflow_test';
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear users before each test
  await User.deleteMany({});
});

describe('POST /register', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('should return 400 if passwords do not match', async () => {
    const res = await request(app).post('/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password1',
      confirmPassword: 'password2',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Passwords do not match');
  });

  it('should return 409 if email already registered', async () => {
    const user = new User({
      username: 'existinguser',
      email: 'existing@example.com',
      password: 'password',
    });
    await user.save();

    const res = await request(app).post('/register').send({
      username: 'newuser',
      email: 'existing@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Email already registered');
  });

  it('should register a new user and send OTP', async () => {
    const res = await request(app).post('/register').send({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered. Please verify OTP sent to your email.');
  });
});

describe('POST /login', () => {
  beforeEach(async () => {
    const user = new User({
      username: 'loginuser',
      email: 'login@example.com',
      password: 'password',
      isVerified: true,
    });
    await user.save();
  });

  it('should return 400 if email or password missing', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  it('should return 401 if user not found', async () => {
    const res = await request(app).post('/login').send({
      email: 'notfound@example.com',
      password: 'password',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 401 if user not verified', async () => {
    const unverifiedUser = new User({
      username: 'unverifieduser',
      email: 'unverified@example.com',
      password: 'password',
      isVerified: false,
    });
    await unverifiedUser.save();

    const res = await request(app).post('/login').send({
      email: 'unverified@example.com',
      password: 'password',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('User not verified. Please verify your email.');
  });

  it('should return 401 if password is incorrect', async () => {
    const res = await request(app).post('/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should login successfully and return token', async () => {
    const res = await request(app).post('/login').send({
      email: 'login@example.com',
      password: 'password',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@example.com');
  });
});
