import { RegulationType } from './RegulationType';

export type Regulation = {
  id: number;
  name: string;
  organizationId: number;
  regulationTypeId: number;
  regulationTypeName: string;
  regulationType: RegulationType;
};
