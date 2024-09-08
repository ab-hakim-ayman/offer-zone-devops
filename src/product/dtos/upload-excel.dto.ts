import { IsEnum } from "class-validator";
import { Actions } from "src/common/enums/actions.enum";

export class UploadExcelDto {
    @IsEnum(Actions)
    action: Actions;
}
