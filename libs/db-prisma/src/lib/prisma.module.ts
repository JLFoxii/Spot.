import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <--- CRITIQUE : Rend le service dispo partout sans ré-importer le module
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // On expose le service aux autres modules
})
export class PrismaModule {}
