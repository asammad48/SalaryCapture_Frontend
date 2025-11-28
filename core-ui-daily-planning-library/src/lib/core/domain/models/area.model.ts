export interface Area {
    areaId: string;
    name: string;
    displayName: string;
    postalCode: string;
    parentId?: string;
    subAreas?: Area[];
    roleId?: string;
}
