export class RemainingTime{

    organizationUnitId!: string;
    startDate!: string;
    endDate!: string;
    deadline !: string;
    isCurrent !: boolean;
    remainingTime !: Deadline
}

export class Deadline {

        days!: number;
        hours!: number;
        minutes!: number;

}

export interface DeadlineRequest{
  organizationUnitId: string
  durationId: number
}
