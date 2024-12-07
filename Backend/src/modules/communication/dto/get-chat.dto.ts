import { ApiProperty } from "@nestjs/swagger";

export class GetChatDto {

    @ApiProperty({
        required: false,
    })
    readonly last_id!: string; 

    @ApiProperty({
        required: true,
        default: 20, //retrieve the last 20 messages to avoid slow performance
        //pagination is used to avoid slow performance
        //will be passed in front end
    })
    readonly limit: number = 10;

}