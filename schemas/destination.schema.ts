import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { DBCollection } from '@shared/constant/DBcollection'
import { LocaleKeys } from '@shared/constant/enum'

import CommonSchema from './common.schema'

@Schema({ collection: DBCollection.DESTINATION, timestamps: true })
export class Destination extends CommonSchema {
    @Prop({
        required: true,
        unique: true,
        type: String
    })
    name: string

    @Prop({
        required: true,
        select: false,
        enum: Object.values(LocaleKeys),
        default: LocaleKeys.zh_CN
    })
    locale: string
}
export const DestinationSchema = SchemaFactory.createForClass(Destination)
