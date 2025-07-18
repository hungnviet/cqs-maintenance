# Robot Next.js App

A full-stack Next.js application with TypeScript, Tailwind CSS, and MongoDB integration.

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **MongoDB** with Mongoose ODM
- **API Routes** for backend functionality
- **Modern UI** with responsive design

## Project Structure

```
robot-next/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   └── users/      # User API endpoints
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── UserForm.tsx    # User creation form
│   │   └── UserList.tsx    # User display component
│   ├── lib/               # Utility libraries
│   │   └── mongodb.ts     # MongoDB connection
│   ├── models/            # Mongoose models
│   │   └── User.ts        # User model
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd robot-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following content:

```env
# MongoDB Connection String
# Replace with your actual MongoDB connection string
# Example: mongodb://localhost:27017/robot-next
# Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/robot-next
MONGODB_URI=mongodb://localhost:27017/robot-next

# Next.js Environment Variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Users API

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

#### Example POST request:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Database Models

### User Model
- `name` (String, required)
- `email` (String, required, unique)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **ESLint** - Code linting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
