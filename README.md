# NCP Next - Nurse Career Platform

A modern Next.js application for connecting nurses with career opportunities, featuring role-based access control, resume parsing, and job matching capabilities.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control**: Separate dashboards for Nurses and Admins
- **User Authentication**: Secure login, registration, and password management
- **Resume Processing**: Automatic parsing of PDF resumes using Mammoth and pdf-parse
- **Job Matching**: Intelligent job recommendations based on nurse profiles
- **Profile Management**: Complete nurse profiles with certifications, education, and experience

### Nurse Features
- Dashboard with job recommendations
- Profile management and settings
- Resume upload and parsing
- Skills and certifications tracking
- Job browsing and applications

### Admin Features
- Admin dashboard with overview
- Nurse management system
- Job posting and management
- System monitoring and analytics

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.4** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend & Database
- **NextAuth 4** - Authentication
- **Supabase** - Database and real-time features
- **PostgreSQL** - Database

### Utilities & Tools
- **React Hook Form** - Form management with Zod validation
- **Resend** - Email service
- **Mammoth** - PDF parsing for resumes
- **pdf-parse** - Additional PDF processing
- **bcryptjs** - Password hashing
- **date-fns** - Date manipulation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase project
- Resend API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Honeegee/NCP.git
   cd NCP
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Resend API Key
   RESEND_API_KEY=your_resend_api_key

   # Email Configuration
   FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Database Setup**
   - Run the Supabase migrations located in `supabase/migrations/`
   - Ensure your Supabase database is properly configured

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin dashboard routes
│   ├── (auth)/            # Authentication routes
│   ├── (nurse)/           # Nurse dashboard routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Shadcn/ui components
│   ├── shared/           # Shared components (Navbar, Footer)
│   ├── profile/          # Profile management components
│   └── registration/     # Registration flow components
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication configuration
│   ├── supabase.ts      # Supabase client
│   ├── validators.ts    # Zod validators
│   └── utils.ts         # Utility functions
└── types/                # TypeScript type definitions
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run dev:webpack  # Start development server with Webpack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🗄️ Database Schema

The application uses Supabase with the following main tables:

- **nurses** - Nurse profiles and credentials
- **jobs** - Job postings and requirements
- **certifications** - Nurse certifications
- **education** - Educational background
- **experience** - Work experience
- **skills** - Professional skills
- **resumes** - Resume documents

Refer to `supabase/migrations/` for detailed schema definitions.

## 🔐 Authentication

The application uses NextAuth.js with the following providers:
- Email/Password authentication
- Session management
- Role-based access control

### Authentication Flow
1. User registration with email verification
2. Login with email/password
3. Password reset functionality
4. Session management with role-based routing

## 📧 Email Features

- Welcome emails for new users
- Password reset emails
- Account verification
- Job notifications (future enhancement)

## 🎨 Styling

- **Tailwind CSS 4** for utility-first styling
- **Radix UI** for accessible components
- **Custom CSS** for global styles and themes
- **Responsive design** for all screen sizes

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Configure `next.config.ts` and build settings
- **AWS Amplify**: Set up build and deployment pipelines
- **Docker**: Use the provided build configuration

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `NEXTAUTH_URL` | NextAuth URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret | ✅ |
| `RESEND_API_KEY` | Resend API key | ✅ |
| `FROM_EMAIL` | Default from email | ✅ |

## 🔒 Security Features

- **Password hashing** with bcryptjs
- **Input validation** with Zod schemas
- **CSRF protection** via NextAuth
- **Environment variable** security
- **Rate limiting** (future enhancement)
- **SQL injection protection** via Supabase

## 📊 Analytics & Monitoring

- Built-in error tracking
- Performance monitoring
- User activity logging
- System health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the Supabase migrations for database schema

## 🔄 Future Enhancements

- Real-time notifications
- Advanced job matching algorithms
- Mobile application
- Integration with nurse licensing boards
- Video interview scheduling
- Performance analytics dashboard
- Multi-language support

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
