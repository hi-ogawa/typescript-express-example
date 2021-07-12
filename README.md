Typescript Express Example

```
# Development
npm install
npm run routes                # Generate routes.ts
docker-compose up postgres    # Run postgres
npm run db:create:development # Create database
npx typeorm migration:run     # Run migration
npm run build
npm run server

# Testing
npm run db:create:test
npm run test
npm run test:watch -- -g "User generateToken" # Grep test case

# Formatting
npm run format

# Console
npm run console
> await g.init()
> await g.User.count()
```
