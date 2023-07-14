import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@utils/prisma/prisma.module';
import { DatatableService, DatatableSettings } from './datatable.service';

@Global()
@Module({
  providers: [DatatableService],
  exports: [DatatableService],
  imports: [PrismaModule],
})
export class DatatableModule {
  static forRoot(settings: DatatableSettings) {
    return {
      module: DatatableModule,
      providers: [
        {
          provide: 'DATATABLE_SETTINGS',
          useValue: settings,
        },
        DatatableService,
      ],
      exports: [DatatableService],
    };
  }
}
