import { DataTableModule } from '@utils/datatable/datatable.module';
import { PrismaModule } from '@utils/prisma/prisma.module';
import { CaslModule } from '@utils/casl/casl.module';

export default [
  DataTableModule.forRoot({
    driver: 'postgresql',
    debugMode: process.env.NODE_ENV === 'development',
    maxLimitPerPage: 1000,
  }),
  PrismaModule,
  CaslModule,
];
