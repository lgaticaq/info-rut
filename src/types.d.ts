declare type Params = {
  type: string;
  key: string;
  term: string;
};

declare type Person = {
  name: string;
  rut: string;
  gender: string;
  address: string;
  city: string;
};

declare type Enterprise = {
  name: string;
  item: string;
  subitem: string;
  activity: string;
  rut: string;
};

declare type Payload = Person | Enterprise;

declare function getData(params: Params): Promise<Payload[]>;

declare function getPersonByRut(rut: string): Promise<Person>;

declare function getEnterpriseByRut(rut: string): Promise<Enterprise>;

declare function reverse(name: string): string;

declare function titleize(name: string): string;

declare function fuzzzySearch(name: string, list: Payload[]): Payload[];

declare function getRut(name: string, type: string): Promise<Payload[]>;

declare function getPersonByName(name: string): Promise<Person[]>;

declare function getEnterpriseByName(name: string): Promise<Enterprise[]>;
