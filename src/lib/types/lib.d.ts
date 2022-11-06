namespace CommandTypes {
  type Stored = {
    info: {
      name: string;
      description: string;
      type: CommandTypes.Target;
      perm: number;
      hide: boolean;
      session: string;
      aliases: Array<string>;
    };
    callback: CommandTypes.Callback;
  };

  type Callback = (
    ctx: FullContext,
    args: Array<string>,
    data: Event.Data,
    self: CommandTypes.Stored
  ) => void;

  type Target = "group" | "private" | "all" | "channel";

  type RegistrationInfo = {
    name: string;
    aliases?: Array<string>;
    hide?: boolean;
    specprefix?: boolean;
    description?: string;
    session?: string;
    permisson?: 0 | 1 | 2;
    type?: CommandTypes.Target;
  };
}

namespace Event {
  type Type = "message" | "text" | "document" | "modules.load" | "release";
  type Stored = {
    position: number;
    callback: Event.Callback;
  };

  type Callback = (
    ctx: FullContext & { message: DM },
    next: () => void,
    data: Event.Data,
    extraData?: Object
  ) => any;
  type Data = {
    DBUser: DB.User;
    DBGroup?: DB.Group;
    userRights: import("telegraf/types").ChatMember;
    user: import("telegraf/types").User;
  };
  type CacheUser = {
    id: number;
    time: number;
    data: Event.Data;
  };
}

namespace DB {
  type User = {
    static: {
      id: number;
      nickname: string;
      name: string;
    };
    cache: {
      nickname?: string;
      session?: string;
      sessionCache?: string[];
      tag?: string;
      lastActive: number;
    };
    needSafe?: true;
  };

  type Group = {
    static: {
      id: number;
      title: string;
    };
    cache: {
      members: Array<number>;
      titleAnimation?: Array<string>;
      titleAnimationSpeed?: number;
      lastCall?: number;
      lastPin?: {};
      pin?: string;
    };
  };
}

type Context = import("telegraf").Context;

type TM = import("telegraf/types").Message.TextMessage;

type C = import("telegraf/types").Message.CommonMessage;

type DM = import("telegraf/types").Message.DocumentMessage;

type CTM = C & TM;

type FullContext = Context & { message: CTM };

namespace QueryTypes {
  type Callback = (
    ctx: Context,
    path: string[],
    callback: (
      text: string,
      extra: import("telegraf/types").Convenience.ExtraReplyMessage
    ) => Promise<void>
  ) => void;
}

type SessionData = typeof import("../start-stop.js").data;
