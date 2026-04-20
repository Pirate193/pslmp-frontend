export type Note = {
  id: string;
  title: string;
  folderId: string | null;
  content: unknown;
  createdAt: string;
  updatedAt: string;
};

export type NoteListItem = Omit<Note, "content">; // list never returns content

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  children?: Folder[];
};

export type Template = {
  id: string;
  creatorId: string;
  name: string;
  description: string | null;
  schemapayload: unknown;
  ispublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Chat = {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  chatId: string;
  role: string;
  content: string;
  parts: unknown;
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  };
};

// request body types — what you SEND to the backend
export type CreateNoteBody = {
  title?: string;
  content?: unknown;
  folderId?: string;
};

export type UpdateNoteBody = {
  title?: string;
  content?: unknown;
  folderId?: string | null;
};

export type CreateFolderBody = {
  name: string;
  parentId?: string;
};

export type UpdateFolderBody = {
  name?: string;
  parentId?: string | null;
};

export type CreateTemplateBody = {
  name: string;
  description?: string;
  schemapayload: unknown;
  isPublic?: boolean;
};

export type CreateChatBody = {
  title: string;
};

export type AddMessageBody = {
  role: string;
  content: string;
  parts: unknown;
};