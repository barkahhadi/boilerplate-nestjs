import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@utils/prisma/prisma.module';
import { DataTableService, DataTableSettings } from './DataTable.service';

@Global()
@Module({
  providers: [DataTableService],
  exports: [DataTableService],
  imports: [PrismaModule],
})
export class DataTableModule {
  static forRoot(settings: DataTableSettings) {
    return {
      module: DataTableModule,
      providers: [
        {
          provide: 'DataTable_SETTINGS',
          useValue: settings,
        },
        DataTableService,
      ],
      exports: [DataTableService],
    };
  }
}
