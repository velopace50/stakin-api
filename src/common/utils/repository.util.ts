export function getFromDto<T>(dto: any, data: any, fields?: string[]): T {
  let properties: string[];
  if (fields && fields.length) {
    properties = fields;
  } else {
    properties = Object.keys(dto);
  }
  properties.forEach((property) => {
    data[property] = dto[property];
  });
  return data;
}

export function bToa(base64: string): Uint8Array {
  return Buffer.from(base64, 'base64');
}

export function aTob(value: Uint8Array): string {
  return Buffer.from(value).toString('base64');
}