  export interface ApiResponse<T>{
    success: boolean
    message: string | undefined
    errors: string[] | undefined
    data: T
  }


  export class DeadlineUploadResponseDto {
    successMessages: string[] = [];
    countDeadlineAdded!: number;
    warningMessages: string[] = [];

    constructor() {
      this.successMessages = [];
      this.warningMessages = [];
    }
  }
