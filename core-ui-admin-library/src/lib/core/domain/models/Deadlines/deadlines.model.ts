import { DateTime } from "luxon"

export class UploadedDeadlineResponseDto{
  id!: string;
  fileName!: string;
  uploadedAt!: Date;
  uploadedBy!: string
}

export class DeadlinesData{
  subArea!: string
  area!: string
  country!: string
  status!: string
  startsFrom!: DateTime
  endsAt!: DateTime
  deadlineDate!: DateTime
  deadlineTime!: string
  duration!: string
}
