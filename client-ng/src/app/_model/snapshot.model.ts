export interface Field {
  name: string;
  owner: string;
  value: any;
}

export interface Snapshot {
  entityId: string;
  collaboratorNames: string[];
  fields: Field[];
}
