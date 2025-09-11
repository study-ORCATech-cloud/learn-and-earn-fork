
# Local Development Guide

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **Git** (optional but recommended) - [Download here](https://git-scm.com/)
- A code editor like **VS Code** - [Download here](https://code.visualstudio.com/)

## Getting Started

### 1. Clone or Download the Project

**Option A: Using Git (Recommended)**
```bash
git clone <your-repository-url>
cd labdojo-learning-platform
```

**Option B: Download ZIP**
1. Download the project as a ZIP file
2. Extract it to your desired location
3. Open terminal/command prompt in the project folder

### 2. Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Framer Motion
- And many more...

### 3. Start the Development Server

Launch the development server with hot reload:

```bash
npm run dev
```

You should see output similar to:
```
VITE v5.0.0  ready in 500ms

➜  Local:   http://localhost:8080/
➜  Network: http://192.168.1.100:8080/
```

### 4. Open in Browser

Navigate to `http://localhost:8080` in your web browser. The website should load with live reload enabled.

## Development Commands

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run TypeScript type checking
npm run type-check

# Lint code (if ESLint is configured)
npm run lint

# Format code (if Prettier is configured)
npm run format
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer)
│   └── ui/            # UI components (Cards, Buttons)
├── pages/              # Page components
├── context/            # React Context providers
├── data/              # Static data files
├── types/             # TypeScript type definitions
├── hooks/             # Custom React hooks
└── styles/            # CSS and styling files
```

## Development Tips

### Hot Reload
- Changes to files automatically refresh the browser
- TypeScript errors appear in the terminal and browser
- Tailwind CSS changes are applied instantly

### Environment Variables
Create a `.env.local` file in the root directory for local environment variables:
```
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

### Port Configuration
To change the default port (8080), modify `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000, // Your preferred port
    host: true,
  },
});
```

### Browser Compatibility
The app supports modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting Development Issues

### Common Issues

**1. Port Already in Use**
```bash
Error: Port 8080 is already in use
```
Solution: Kill the process using the port or change the port in `vite.config.ts`

**2. Module Not Found Errors**
```bash
Error: Cannot resolve module '@/components/...'
```
Solution: Check if the file exists and the import path is correct

**3. TypeScript Errors**
```bash
Type 'string' is not assignable to type 'number'
```
Solution: Check type definitions in `src/types/` and fix type mismatches

**4. Node Modules Issues**
```bash
npm ERR! peer dep missing
```
Solution: Delete `node_modules` and `package-lock.json`, then run `npm install`

### Performance Tips

- Use React DevTools for component debugging
- Monitor bundle size with `npm run build`
- Check console for warnings and errors
- Use browser DevTools for performance profiling

### Code Quality

- Follow TypeScript strict mode
- Use ESLint for code linting
- Follow React best practices
- Use proper semantic HTML
- Ensure accessibility compliance

## Next Steps

Once you have the development environment running:
1. Explore the codebase
2. Make your changes
3. Test thoroughly
4. Follow the deployment guide when ready to publish

For deployment instructions, see `deployment-guide.md`.
For troubleshooting, see `troubleshooting.md`.
