import { ObjectId } from "mongodb";
import { EncodingStatus } from "~/constants/enums";

export interface VideoStatusType {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  message?: string
  createdAt?: Date
  updatedAt?: Date
}

export default class VideoStatus {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  message: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id, name, status, message, createdAt, updatedAt }: VideoStatusType) {
    this._id = _id
    this.name = name
    this.status = status
    this.message = message || ""
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }
}