import { IsEnum } from "class-validator";
import { Action } from "src/common/enums/actions.enum";

export class UploadExcelDto {
    @IsEnum(Action)
    action: Action;
}
