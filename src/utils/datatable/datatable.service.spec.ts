import { DatatableService } from './datatable.service';

describe('DatatableService', () => {
  let service: DatatableService;

  beforeEach(() => {
    service = new DatatableService();
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
