
import { IUptiverseUser } from "./IUptiverseUser";

export interface IRecruit {

                    connection: string;
                    connections?: object;
                    createdBy?: IUptiverseUser;
                    firstname: string;
                    id: string;
                    lastname: string;
                    status?: number;
}
