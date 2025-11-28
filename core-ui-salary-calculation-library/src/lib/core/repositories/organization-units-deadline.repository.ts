import { Observable } from "rxjs";
import { DeadlineRequest, RemainingTime } from "../domain/models";


export abstract class OrganizationUnitsDeadLineRepository{
    abstract getOrganizationUnitsDeadlines(request: DeadlineRequest): Observable<RemainingTime>;
}
