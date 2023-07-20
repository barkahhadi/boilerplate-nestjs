import { DataTableService } from './DataTable.service';

describe('DataTableService', () => {
  let service: DataTableService;

  beforeEach(() => {
    service = new DataTableService();
  });

  describe('buildQueryFilterDateBetween', () => {
    it('should return the correct query', () => {
      const query = `SELECT * FROM User`;
      service.fromQuery(
        query,
        {
          driver: 'postgresql',
        },
        null,
      );

      const resultQuery = service.getQuery();
    });
  });
});
