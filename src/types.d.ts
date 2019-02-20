export interface Params {
  type: string
  key: string
  term: string
}

export interface Person {
  name: string
  rut: string
  gender: string
  address: string
  city: string
}

export interface Enterprise {
  name: string
  item: string
  subitem: string
  activity: string
  rut: string
}

export type Payload = Person | Enterprise

export function getData (params: Params): Promise<Payload[]>

export function getPersonByRut (rut: string): Promise<Person>

export function getEnterpriseByRut (rut: string): Promise<Enterprise>

export function reverse (name: string): string

export function titleize (name: string): string

export function fuzzzySearch (name: string, list: Payload[]): Payload[]

export function getRut (name: string, type: string): Promise<Payload[]>

export function getPersonByName (name: string): Promise<Person[]>

export function getEnterpriseByName (name: string): Promise<Enterprise[]>
