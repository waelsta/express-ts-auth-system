import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default prisma;

export async function connectToDatabase() {
  await prisma
    .$connect()
    .then(
      () => console.log('connected to postgresql 🐘✨'),
      (err) => console.log('could not connect to postgresql 🛟' ,err)
    )
    .catch(err => console.log('error connecting to database', err));
}

export async function disconnectFromDatabase() {
  await prisma
    .$disconnect()
    .then(() => console.log('disconnected from database 🐘✨'))
    .catch(err => console.log('error connecting to database', err));
}
