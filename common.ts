let playerIdCount = 0;
const generatePlayerId = () => {
    const cnt = playerIdCount;
    playerIdCount += 1;
    return cnt;
};
export class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
export const computeVectorMagnitude = (v: Vector) => {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
};
export const normalizeVector = (v: Vector) => {
    let mag = computeVectorMagnitude(v);
    return new Vector(v.x / mag, v.y / mag);
};

export class Player {
    color: string = "black";
    position: Position;
    id: number;
    size: number = 5;
    direction: Vector = new Vector(0, 0);
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
    body: object;
}

export class playerUpdateMessage implements message {
    kind = "playerupdate";
    body: Player;
    constructor(player: Player) {
        this.body = player;
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
    kind = "keypress";
    body: KeyPress;
    constructor(keyPress: KeyPress) {
        this.body = keyPress;
    }
}
