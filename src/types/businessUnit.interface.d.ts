interface BaseSearchedBusinessUnit {
  id: number;
  name: string;
  orderNo: number;
}

interface SearchedBusinessUnit {
  id: number;
  name: string;
  orderNo: number;
  middleCategory?: BaseSearchedBusinessUnit;
  majorCategory?: BaseSearchedBusinessUnit;
}

interface SortLocalSearchedBusinessUnitPayload {
  businessUnitSearch: SearchedBusinessUnit[];
}

interface BusinessLevelPayload {
  businessLevel: BusinessUnitLevelType;
}
