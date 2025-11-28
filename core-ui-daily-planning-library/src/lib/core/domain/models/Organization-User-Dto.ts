export interface OrganizationUserDto{
    areaId: string
    name: string
    displayName: string
    postalCode: string
    parentId?: string
    subAreas?: OrganizationUserDto[]
    roleId?: string
}
