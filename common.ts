let playerIdCount = 0;
const generatePlayerId = () => {
    const cnt = playerIdCount;
    playerIdCount += 1;
    return cnt;
};
export class Player {
    color: string = "black";
    position: Position;
    id: number;
    size: number = 5;
    direction: number = 0;
    speed: number = 0;
    constructor(color: string, position: Position) {
        this.id = generatePlayerId();
        this.color = color;
        this.position = position;
    }
}

export class Position {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export interface message {
    kind: string;
    body: string;
}

export class playerUpdateMessage implements message {
    kind = "playerupdate";
    body = "";
    constructor(body: Player) {
        this.body = JSON.stringify(body);
        //TODO: more compact, specific messages according to particular actions and updates
    }
}

export class KeyPress {
    key: string;
    isPressed: boolean;
    constructor(key: string, isPressed: boolean) {
        this.key = key;
        this.isPressed = isPressed;
    }
}

export class playerInputMessage implements message {
    kind = "keydown";
    body = "";
    constructor(keyPress: KeyPress) {
        this.body = JSON.stringify(keyPress);
    }
}
