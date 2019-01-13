import { AttachmentId } from '../../core/data/model/entities/note';

export class AttachmentAction {
  readonly id: AttachmentId;
  readonly type: AttachmentActionType;

  constructor(id: AttachmentId, type: AttachmentActionType) {
    this.id = id;
    this.type = type;
  }
}

export enum AttachmentActionType {
  DELETE = 'delete',
  OPEN = 'open',
  SAVE = 'save'
}
