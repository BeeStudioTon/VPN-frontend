import { ServerData } from './servers';
import { UserTypeUser } from './user'

export interface KeysType {
    keys: KeyType[]
    user: UserTypeUser
}

export interface KeyType {
    id: number;

    userId: number;
  
    isActive: boolean;
  
    nameServer: string;
  
    outlineId: string;
  
    server: ServerData;
  
    serverId: number;
  
    keyData: string;
  
    createdAt: string;
}
