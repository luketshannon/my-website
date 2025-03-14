
// LIGHTBREAK

// a generative light algorithm
// luke shannon 2023

// 1. pick a point and direction  ->
// 2. release the ray             ----->
// 3. calculate intersections     ----->x
// 4. calculate reflection angle  ------\
//                                      V
//
// 5. repeat                      ------\
//                                      |
//                                      V

// iters = 0
// while (q.length && iters < params.i) {
//     iters++
//     let p = q.shift()
//     let toIntersect = [...params.bboxes]
//     if (params.selfreflect) toIntersect = [...toIntersect, ...rays]
//     let intersection = p.rayIntersect(toIntersect, p.dir)
//     if (intersection) {
//         p.addPoint(intersection.point)
//         let dir = reflect(p.dir, intersection, i * params.colorAngle)
//         if (dir) {
//             p.dir = dir
//             q.push(p)
//         }
//     }
// }
// rays.map(p => p.draw(1, 0, params.smooth))

// let seed = '' //0xd27bde8d83cade3366e8220053de6d2b41b48317ea1a87d0e000a397eec2e869

const uP = new URLSearchParams(window.location.search);
let uS = uP.get('png') ?? ''
let uSS = uP.get('svg') ?? ''
let uSp = uP.get('speed') ?? ''
let uH = uP.get('hash') ?? ''
let uF = uP.get('full') ?? ''
let uI = uP.get('i') ?? ''
let uA = uP.get('animate') ?? ''
let uIn = uP.get('invert') ?? ''
let uC = uP.get('clock') ?? ''
let uAR = uP.get('aspect') ?? ''
let uM = uP.get('margin') ?? ''
let uRM = uP.get('spin') ?? ''
let uBB = uP.get('bboxes') ?? ''

let A_R = window.innerHeight / window.innerWidth//uAR != '' ? parseFloat(uAR) : 1
console.log(A_R)
let D_S = 1000
let DIM = Math.min(window.innerWidth, window.innerHeight / A_R)
let S = DIM / D_S
let pxDensity = 2

let tokenData = {
    hash: "",
    tokenId: "123000456"
}

tokenData.hash = uH != '' ? uH : tokenData.hash

function presetup() {
    // canvas = createCanvas(1000 * S, 1000 * S * A_R)

    let canvas = createCanvas(1000 * S, 1000 * S * A_R); // Fullscreen canvas
    canvas.parent('p5-container'); // Attach the canvas to the div
    canvas.style('z-index', '-1'); // Ensure the canvas is behind the HTML elements
    canvas.position(0, 0); // Align to the top-left corner
    pixelDensity(pxDensity)
    setupUseful()

    noFill()
    strokeWeight(1)
    strokeJoin(BEVEL)

    sGP()
}

// Array to store polygons
let htmlpolys = [];

// Function to update the `polys` array with bounding box data
function updateHTMLPolys() {
    // Select all text elements (headers, paragraphs, buttons)
    // const elements = document.querySelectorAll('.container');
    const elements = []//document.querySelectorAll('');

    // Clear the polys array
    htmlpolys = [];

    elements.forEach(element => {
        // Get bounding box of the element
        const rect = element.getBoundingClientRect();

        // Calculate the center x, center y, width, and height of the element
        const x = rect.left + rect.width / 2// + window.scrollX;
        const y = rect.top + rect.height / 2// + window.scrollY;
        const w = rect.width;
        const h = rect.height;

        // Add rectangle data to polys array (using Poly.rect format)
        htmlpolys.push(Poly.rect(x, y, w, h));

        // Example call if Poly.rect is a function you use
        // Poly.rect(centerX, centerY, width, height);
    });
}

// Update canvas and polys when window is resized
function windowResized() {
    resizeCanvas(windowWidth, windowHeight); // Resize the canvas
    updateHTMLPolys(); // Recalculate the positions of elements
    W = windowWidth
    H = windowHeight
}

// Event listener for scrolling to update the polys and redraw the canvas
window.addEventListener('scroll', () => {
    updateHTMLPolys(); // Recalculate the positions of elements based on scroll
    // redraw(); // Redraw the canvas
});

let gp = {}
function sGP() {
    gp.margin = uM != '' ? float(uM) * W * S : 5 * S
    gp.backgroundColor = uIn != '' ? 0 : 255
    gp.strokeColor = uIn != '' ? 255 : 0
    gp.mousePathLength = 20
    gp.i = uI != '' ? int(uI) : 4000
    gp.distanceSqOK = 100
    gp.speed = uSp != '' ? float(uSp) : 100 * S//S * 3
    gp.smooth = rnd() < 0.10
    gp.animate = uA != '' ? false : false
    gp.n = [2]
    gp.angle = weightedPick([1, 2, 3, 4], [20, 5, 3, 1])
    gp.backgroundAlpha = 255//150
    gp.numLines = 1//weightedPick([3, 4, 5, 6, 7], [80, 1, 1, 1, 3])
    gp.oddsExtraParams = rnd() < 0.75 ? 0.15 : 0
    gp.hash = tokenData.hash
    gp.rateMultiplier = uRM != '' ? float(uRM) : 1

    print('thank you p5.js and everyone behind it <3')
    frameRate(30)
}

let decTime = uC != '' ? 0 : undefined
let artxcode = []
async function setup() {
    presetup()
    let sizeMult = 0.3

    // artxcode = await getPolysFromSVG('artxcode-vpype.svg')
    // let com = vec((artxcode[0].bbl + artxcode[artxcode.length - 1].bbr) / 2,
    //     (artxcode[0].bbt + artxcode[artxcode.length - 1].bbb) / 2)
    // com.mult(sizeMult)
    // artxcode = artxcode.map(p => {
    //     let newp = new Poly(p.shape, W / 2 - com.x, H + 100 - com.y, sizeMult, 0)
    //     newp.shape.push(newp.shape[0])
    //     return newp
    // })

    // let rndPolyPoint = (p) => {
    //     let i = floor(rnd(p.shape.length))
    //     let ip = rnd()
    //     return p5.Vector.lerp(p.shape[i], p.shape[(i + 1) % p.shape.length], ip)
    // }
    let rndChord = (p) => {
        let i, ip, j, jp
        do {
            i = floor(rnd(p.shape.length))
            ip = rnd()
            j = floor(rnd(p.shape.length))
            jp = rnd()
        } while (i == j)
        return new Poly([p5.Vector.lerp(p.shape[i], p.shape[(i + 1) % p.shape.length], ip), p5.Vector.lerp(p.shape[j], p.shape[(j + 1) % p.shape.length], jp)], 0, 0, 1, 0, 0)
    }
    for (let i = 0; i < gp.numLines; i++) {
        let border = Poly.rect(W / 2, H / 2, W - gp.margin - 10 * S, H - gp.margin - 10 * S)
        let root = rndChord(border)
        // root.draw()
        let r = rtri(5, 10, 30) * 10
        root.reseed(r * S, 0)
        let dir = vec(0, 1)
        dir.rotate(rnd(TAU))
        let pts = root.shape

        for (let j = 0; j < 2.5; j++) {
            if (rnd() < gp.oddsExtraParams) {
                setupParams(undefined, { n: rnd([2, 2, 2, 3, 5, 7]), offset: rnd(TAU), x: rnd(gp.margin / 2 + 10 * S, W - gp.margin / 2 - 10 * S), y: rnd(gp.margin / 2 + 10 * S, H - gp.margin / 2 - 10 * S) })
            }
        }
        for (let pt of pts) {
            setupParams(undefined, { lineNum: i, n: rnd(gp.n), offset: dir.heading(), x: pt.x, y: pt.y, rateMultiplier: 10 ** i })
        }
        for (let j = 0; j < 2; j++) {
            if (rnd() < gp.oddsExtraParams) {
                setupParams(undefined, { n: rnd([2, 2, 2, 3, 5, 7, 12, 24]), offset: rnd(TAU), x: rnd(gp.margin / 2 + 10 * S, W - gp.margin / 2 - 10 * S), y: rnd(gp.margin / 2 + 10 * S, H - gp.margin / 2 - 10 * S) })
            }
        }
    }
    mousePoly = Poly.rect(W / 2, H / 2, W, H)
    // thread = new Thread(bbox = mousePoly, col = undefined, shape = [], addN = 100, maxN = 100, maxR = 100, minRPercent = 0.1, center = vec(W / 2, H / 2))
}
let allParams = []
function setupParams(idx, opt = {}) {
    let params = {}

    params.animate = gp.animate
    params.x = opt.x ?? W / 2
    params.y = opt.y ?? H / 2
    // params.bboxX = opt.bboxX ?? W / 2
    // params.bboxY = opt.bboxY ?? H / 2
    // params.w = opt.w ?? undefined
    // params.h = opt.h ?? undefined
    // constant params
    // params.colors = opt.colors ?? 255
    // params.numColors = opt.numColors ?? 1
    params.colorAngle = opt.colorAngle ?? 0
    // params.rate = opt.rate ?? gp.rate
    params.rateMultiplier = opt.rateMultiplier ?? gp.rateMultiplier ?? 1
    params.speed = gp.speed
    params.smooth = opt.smooth ?? gp.smooth
    params.lineNum = opt.lineNum ?? undefined

    // initial rays
    // params.center = vec(W / 2, H / 2)
    // params.centers = opt.centers ?? [vec(params.x, params.y)]
    params.centers = [vec(opt.x, opt.y)] ?? [vec(params.x, params.y)]
    // [1, 2, 3, 4, 9, 31] 16
    // bboxes
    // grid missing center
    // random
    // open shapes
    // round outer bbox
    params.angle = opt.angle ?? gp.angle
    // params.bboxes = opt.bboxes ?? []
    params.offset = opt.offset ?? 1234
    params.sOffset = opt.sOffset ?? opt.offset
    params.i = opt.i ?? Infinity
    params.counter = 0
    params.selfreflect = opt.selfreflect ?? 1
    params.n = opt.n ?? gp.n
    // params.bboxVis = opt.bboxVis ?? false

    // if (!(params.x == undefined || params.y == undefined || params.w == undefined || params.h == undefined)) {
    //     let bbox = Poly.rect(params.bboxX, params.bboxY, params.w, params.h)
    //     bbox.shape.push(bbox.shape[0].copy())
    //     bbox.vis = params.bboxVis
    //     params.bboxes.push(bbox)
    // }

    // globalbboxes.push(...params.bboxes)
    // params.bboxes = []

    params.oldrays = opt.rays
    params.rays = []

    if (params.n != 0) {
        for (let center of params.centers) {
            for (let j = 0; j < TAU; j += TAU / params.n) {
                let p = new Poly([center.copy()], 0, 0, 1, 0, 0)
                p.dir = vec(cos(j + params.offset), sin(j + params.offset))
                p.paramIdx = idx ?? allParams.length
                p.distance = 0
                // let c = color('#383124')
                // let permuteColor = (c, d = 100) => {
                //     return color(
                //         red(c) + rnd(-d / 2, d / 2),
                //         green(c) + rnd(-d / 2, d / 2),
                //         blue(c) + rnd(-d / 2, d / 2))
                // }
                // c = permuteColor(c, 100)
                // p.setColor(-1, c)
                params.rays.push(p)
            }
        }
    }

    if (idx === undefined) allParams.push(params)
    else allParams[idx] = params
    return params
}

let q = []
let rays = []
let globalbboxes = []
let mousePath = []
let mousePoly
let thread
let qt
// function mouseMoved() {
//     if (!mmAdd) return
//     mmAdd = 0
//     mousePath.push(vec(mouseX, mouseY))
// }
// let mmAdd = 0
function draw() {


    // gp.speed = 400
    // if (frameCount == 40) {
    //     //reload page
    //     location.reload()
    // }
    if (uF != '') {
        resizeToFit()
        uF = ''
    }
    while (mousePath.length > gp.mousePathLength) {
        mousePath.shift()
    }
    mmAdd = 1

    blendMode(BLEND)
    background(gp.backgroundColor, gp.backgroundAlpha)
    // artxcode = artxcode.map(p => {
    //     let newp = new Poly(p.shape, 0, -1, 1, 0)
    //     return newp
    // })

    // background(255)
    // if (frameCount == 10)
    //     thread.update()
    // thread.draw()
    // print(thread)
    // blendMode(ADD)

    let p = new Poly(mousePath, 0, 0, 1, 0, 0)
    p.setColor(-1, color(gp.strokeColor, 255))
    p.vis = 1
    mousePoly = p

    // allParams.map(p => {
    //     if (p.animate) { p.offset += p.rateMultiplier * p.rate / 1000 }
    // })
    if (decTime == undefined) {
        let mill = millis()
        let min = mill / 1000 / 60 / 60
        let hour = min / 60
        let day = hour / 24
        let week = day / 7
        let group = [min, hour, day]
        allParams.map((p, i) => {
            if (p.animate && (p.lineNum == undefined || p.lineNum > 3)) { p.offset = p.sOffset + week * TAU }
            else if (p.animate) { p.offset = p.sOffset + group[p.lineNum] * TAU * gp.rateMultiplier }
        })
    }
    else if (decTime) {
        let getTimeAsPercentageOfDecimalWeek = () => {
            const decimalStart = new Date('1793-10-05T00:00:00Z'); // Start date of the decimal week system
            const now = new Date(); // Current date and time

            // Calculate the difference in milliseconds between now and the start of the decimal system
            const diffInMs = now - decimalStart;

            // Convert milliseconds to days
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

            // Calculate the current position in the 10-day cycle, starting from 0
            const currentDayInDecimalWeek = diffInDays % 10;

            // Calculate the current time (hours, minutes, seconds) as a fraction of a day
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const milliseconds = now.getMilliseconds();
            const fractionOfDay = (hours * 3600 + minutes * 60 + seconds + milliseconds / 1000) / (24 * 3600);

            // Calculate the total fraction through the 10-day week
            const totalFractionThroughDecimalWeek = (currentDayInDecimalWeek + fractionOfDay) / 10;

            return totalFractionThroughDecimalWeek;
        };

        let pct = getTimeAsPercentageOfDecimalWeek()
        allParams.map((p, i) => {
            if (p.animate && (p.lineNum == undefined || p.lineNum > 3)) { p.offset = pct }
            else if (p.animate) { p.offset = PI / 2 + pct * TAU * 10 ** (3 - p.lineNum - 1) }
        })
    } else {
        let getClockHandPercentagesWithMilliseconds = () => {
            const now = new Date();
            const dayOfWeek = now.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
            const adjustedDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Adjust so Monday is 0, ..., Sunday is 6
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const milliseconds = now.getMilliseconds();

            // Convert the hour to a 12-hour format and include minutes, seconds, and milliseconds for its percentage
            const totalSecondsInHour = (hours % 12) * 3600 + minutes * 60 + seconds + milliseconds / 1000;
            const hourPercentage = (totalSecondsInHour / (12 * 3600));

            // Include seconds and milliseconds for the minute's percentage
            const totalMillisecondsInMinute = minutes * 60000 + seconds * 1000 + milliseconds;
            const minutePercentage = (totalMillisecondsInMinute / 3600000);

            // Calculate the second's percentage including milliseconds
            const totalMillisecondsInSecond = seconds * 1000 + milliseconds;
            const secondPercentage = (totalMillisecondsInSecond / 60000);

            // Calculate the week's percentage
            const millisecondsSinceMonday = (adjustedDayOfWeek * 24 * 60 * 60 * 1000) // Days since Monday
                + (hours * 60 * 60 * 1000) // Hours since last full hour
                + (minutes * 60 * 1000) // Minutes since last full minute
                + (seconds * 1000) // Seconds since last full second
                + milliseconds; // Milliseconds since last full second
            const weekPercentage = (millisecondsSinceMonday / (7 * 24 * 60 * 60 * 1000));

            return [
                minutePercentage,
                hourPercentage,
                weekPercentage
            ];
        }
        // deep work in 10 minutes after coffee
        let pct = getClockHandPercentagesWithMilliseconds()
        // print(floor(pct[2] * 7), floor(pct[1] * 12), floor(pct[0] * 60))
        allParams.map((p, i) => {
            if (p.animate && (p.lineNum == undefined || p.lineNum > 3)) { p.offset = pct[2] }
            else if (p.animate) { p.offset = PI / 2 + pct[p.lineNum] * TAU }
        })
    }



    let allbox = Poly.rect(W / 2, H / 2, W - gp.margin, H - gp.margin)
    allbox.vis = 0
    allbox.shape.push(allbox.shape[0].copy())
    updateHTMLPolys()
    // print(htmlpolys[0].shape[0].y)
    globalbboxes = [allbox, mousePoly, ...htmlpolys]
    if (uBB != '') {
        parseBBox(uBB).map(p => globalbboxes.push(p))
    }
    allParams = allParams.map((p, i) => setupParams(i, p))
    allParams.map(p => p.counter = 0)
    qt = new GridQT(0, 0, W, H, 25 * S)
    for (let bbox of globalbboxes) {
        qt.add(bbox)
    }

    let rays = tickRays(0)

    // let c

    // c = color(gp.strokeColor, 255)

    rays.map(p => {
        let params = allParams[p.paramIdx]
        // p.setColor(-1, c)
        // p.drawDistance(minIdx = 0, maxIdx = p.upToIdx, minDistance = 0, maxDistance = p.distance, params.smooth)
        // p.reseed(1)
        if (params.smooth) {
            p.shape.splice(0, 0, p.shape[0].copy())
            p.shape.splice(p.shape.length, 0, p.shape[p.shape.length - 1].copy())
        }
        p.draw(1, 0, params.smooth)
        if (params.smooth) {
            p.shape.splice(0, 1)
            p.shape.splice(p.shape.length - 1, 1)
        }
        // p.drawNodes()
    })

    globalbboxes.map(p => {
        stroke(gp.strokeColor)
        p.closed = false
        if (p.vis)
            p.draw()
    })
    // }

    // let leftHalf = get(0, 0, width / 2, height);
    // // Paste and mirror it on the right half
    // push();
    // translate(width, 0);
    // scale(-1, 1);
    // image(leftHalf, 0, 0);
    // pop();
    timeText()
    artxcode.map(p => {
        p.setColor(255, 0)
        p.draw()
    })

    if (uS != '') {
        if (frameCount == int(uS)) {
            saveNamed()
        }
    }
    if (uSS != '') {
        if (frameCount == int(uSS)) {
            saveMySVG()
        }
    }
}

// if interrupted on it's end then it works but if interrupted earlier then it resets to the last intersection and then reprojects
// after being interrupted it projects to the end of the next intersection

function tickRays(i) {
    // allParams.map(p => p.speed += 0.001)
    let rays = allParams.map(p => p.rays).flat()
    let oldrays = allParams.map(p => p.oldrays).flat()
    // zip rays and oldrays
    let allrays = rays.map((p, i) => [p, oldrays[i]])
    allParams.map(p => p.counter = 0)
    q = [...allrays]
    // frameRate(1)
    let counter = 0
    // allrays.map(p => print(p[1].distance, 'b'))
    // print(allrays.length, 'l')
    // print(allrays)
    // let startMillis = millis()
    while (q.length && counter < gp.i) {
        // if (millis() - startMillis > 500) break
        let [p, oldp] = q.shift()
        let params = allParams[p.paramIdx]
        params.counter++
        if (params.counter > params.i) continue
        counter++
        let toIntersect = [...globalbboxes]
        if (params.selfreflect) toIntersect = [...toIntersect, ...rays]
        // let intersection = p.rayIntersect(toIntersect, p.dir)
        let intersection = qt.rayIntersect(p.shape[p.shape.length - 1], p.dir)
        // frameRate(1)
        // behavior should be
        // 1. grow continuously
        // 2. bounce of things that already exist
        // 3. only restart from last change if there is a significant change in path.
        // print(oldp.distance, 'a')
        if (intersection) {
            // if this intersection results in a different path, then restart growth from here in the new direction
            // if this intersection occurs at a spot already visited then continue the ray
            // if this intersection occurs in the same direction and at the end of this ray, then continue growing
            if (p.shape.length < oldp.upToIdx) {
                let oldpoint = oldp.shape[p.shape.length] ?? oldp.shape[oldp.shape.length - 1]
                if (distSq(oldpoint, intersection.point) > gp.distanceSqOK) {
                    if (oldp.shape.length <= p.shape.length) {
                        // print('if this happens find out why')
                        continue
                    }
                    p.distance = dist(p.shape[p.shape.length - 1].x, p.shape[p.shape.length - 1].y, oldp.shape[p.shape.length].x, oldp.shape[p.shape.length].y)

                    oldp.distance = p.distance

                    p.upToIdx = p.shape.length
                    oldp.shape = oldp.shape.slice(0, p.shape.length)
                    let d = dist(intersection.point.x, intersection.point.y, p.shape[p.shape.length - 1].x, p.shape[p.shape.length - 1].y)
                    let pausepoint = p5.Vector.lerp(p.shape[p.shape.length - 1], intersection.point, p.distance / d)
                    p.addPoint(pausepoint)
                    continue
                }

                p.addPoint(intersection.point)
                // debugCircle(intersection.point, 5, 'red')
                let dir = reflect(p, intersection, 0)
                if (dir) {
                    p.dir = dir
                    p.upToIdx = p.shape.length
                    q.push([p, oldp])
                }
                continue
            } else {
                // print(22)
                if (i == 0)
                    oldp.distance += params.speed
                p.distance = oldp.distance
                p.upToIdx = oldp.upToIdx
                let d = dist(intersection.point.x, intersection.point.y, p.shape[p.shape.length - 1].x, p.shape[p.shape.length - 1].y)
                // debugCircle(intersection.point, 5, 'green')
                if (p.distance < d) {
                    let lerped = p5.Vector.lerp(p.shape[p.shape.length - 1], intersection.point, p.distance / d)
                    // debugCircle(lerped, 5, 'blue')
                    p.addPoint(lerped)
                    continue
                }
                p.addPoint(intersection.point)
                p.distance = 0
                p.upToIdx = p.shape.length
                continue
            }
            print('should not be here')
        } else {
            // no intersection
            // print('shouldnt happen')
            p.upToIdx = oldp.upToIdx
            p.distance = oldp.distance
        }
    }

    return rays
}



function reflect(p, intersection, refractionIdx = 0) {
    let dir = p.dir
    let params = allParams[p.paramIdx]
    let intersected = intersection.dir
    let a1 = intersected.copy()
    let i2 = intersected.copy().rotate(PI / 2)
    let refldir = dir.copy().reflect(i2)
    let a2 = dir.copy()
    // // if bounce returns exactly on the same ray
    if (abs(abs(a1.angleBetween(a2)) - PI / 2) < 0.00000001) {
        // print(1)
        return undefined
    }
    // extra rotation
    let extra = refractionIdx * (p5.Vector.cross(dir, intersected).z < 0 ? 1 : -1)
    let rotateDirection = -(p5.Vector.cross(dir, refldir).z < 0 ? -1 : 1)

    // print(params.angle)
    if (params.angle == 2) return dir.rotate(-(PI / 2 + 0.01) * rotateDirection).rotate(extra)
    if (params.angle == 3) return dir.rotate(-(PI * 2 / 3 + 0.01) * rotateDirection).rotate(extra)
    if (params.angle == 4) return dir.rotate(-(PI - 0.02) * rotateDirection).rotate(extra)
    if (params.angle == 5) return undefined
    return refldir.rotate(extra)
}

// function deepdircopy(a) {
//     return a.map(p => {
//         let newp = p.copy()
//         newp.dir = p.dir.copy()
//         newp.paramIdx = p.paramIdx
//         return newp
//     })
// }
saving = false
// function mouseClicked() {
//     if (saving) return
//     // let boundary = Poly.rect(W / 2, H / 2, W * gp.margin, H * gp.margin)
//     // let p = vec(mouseX, mouseY)
//     // if (!boundary.contains(p)) return
//     if (mouseX < gp.margin / 2 || mouseX > W - gp.margin / 2 || mouseY < gp.margin / 2 || mouseY > H - gp.margin / 2) return
//     setupParams(undefined, { bboxVis: 1, n: 20, offset: rnd(TAU), x: mouseX, y: mouseY, angle: rnd([1]) })
//     // allParams = allParams.map((p, i) => { p.colors = color(255, 255); return p })
// }

function parseBBox(str) {
    let shapepairs = str.split(';').map(p => p.split(',').map(p => parseFloat(p)))
    let shapes = []
    for (let i = 0; i < shapepairs.length; i++) {
        let shape = []
        for (let j = 0; j < shapepairs[i].length; j += 2) {
            shape.push(vec(shapepairs[i][j], shapepairs[i][j + 1]))
        }
        shapes.push(shape)
    }
    polys = shapes.map(shape => new Poly(shape, 0, 0, W, 0, 0, -1, gp.strokeColor))
    polys.map(p => p.vis = 1)
    return polys

}

// function touchMoved() {
//     if (saving) return
//     if (touches.length == 1) {
//         let p = vec(mouseX, mouseY)
//         mousePath.push(p)
//     }
//     return false

// }

function keyPressed() {
    if (key == 'p') saveNamed()
    if (key == 's') {
        saveMySVG()
    }
    if (key == 'c') {
        if (decTime == undefined) {
            decTime = 0
        } else {
            decTime = !decTime
        }
        timeCounter = 25
    }
    // if key is a number then set globalparams.i to that
    if (key >= '1' && key <= '9') {
        gp.i = parseInt(key) * 1000
    }
    if (key == '-') {
        gp.i = max(gp.i - 1000, 500)
    } else if (key == '=') {
        gp.i += 1000
    }
    if (key == ' ') {
        gp.animate = !gp.animate
    }
    // if the up arrow is pressed
    if (keyCode == UP_ARROW) {
        gp.speed *= 2
    } else if (keyCode == DOWN_ARROW) {
        gp.speed = max(gp.speed /= 2, 1 / 16)
    } else if (keyCode == RIGHT_ARROW) {
        if (gp.animate)
            gp.rateMultiplier *= 1.25
        else
            allParams.map(p => p.offset += 0.1)
    } else if (keyCode == LEFT_ARROW) {
        if (gp.animate)
            gp.rateMultiplier *= 0.75
        else
            allParams.map(p => p.offset -= 0.1)
    }
    if (key == 'f') {
        resizeToFit()
    }
    if (key == 'm') { // toggle mouse path
        mousePath = []
    }
    if (key == 'n') {
        gp.mousePathLength = gp.mousePathLength > 200 ? 100 : Infinity
    }
    if (key == 'b') {
        gp.backgroundColor = gp.backgroundColor ? 0 : 255
        gp.strokeColor = !gp.strokeColor ? 255 : 0
    }
}

function resizeToFit() {
    W = window.innerWidth
    H = window.innerHeight
    for (let i = 0; i < allParams.length; i++) {
        let p = allParams[i]
        // do this but account for margins
        // p.x = p.x / width * W
        // p.y = p.y / height * H
        p.x = map(p.x, gp.margin / 2, width - gp.margin / 2, gp.margin / 2, W - gp.margin / 2)
        p.y = map(p.y, gp.margin / 2, height - gp.margin / 2, gp.margin / 2, H - gp.margin / 2)

    }
    resizeCanvas(W, H)
}

let timeCounter = 0
function timeText() {
    if (timeCounter <= 0) return
    timeCounter--
    push()
    textSize(24 * S)
    textAlign(CENTER, CENTER)
    fill(255)
    stroke(0)
    strokeWeight(0.5)
    if (decTime) text('decimal time', W / 2, H / 2)
    else text('standard time', W / 2, H / 2)
    pop()
}



/**
 * Save SVG element to file.
 * https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an
 * 
 * @param {SVGElement} svgElement
 * @param {string} name
 * 
 * @example
 * 
 * saveSVGElement(svgcanvas, `${time} -- ${tokenData.hash}.svg`);
 */
function saveSVGElement(svgElement, name) {
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgElement.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {
        type: "image/svg+xml;charset=utf-8",
    });
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click(); // TODO remove before production, saves svg as download automatically
    document.body.removeChild(downloadLink);
    return svgElement
}

/**
 * Create SVG element from global array of polygons `polys`.
 * 
 * @param {Polygon[]} polys
 * 
 * @example
 * 
 * let svgcanvas = createSVGCanvas(polys);
 */
function createSVGCanvas() {
    ns = "http://www.w3.org/2000/svg";
    svg = document.createElementNS(ns, "svg");
    groups = [];

    // svg.setAttribute("width", "100vw");
    // svg.setAttribute("height", "100vh");
    svg.setAttribute("width", width + "px");
    svg.setAttribute("height", height + "px");

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute('style', 'background-color:white;')

    // background rectangle of white
    let bg = document.createElementNS(ns, "rect");
    bg.setAttribute("x", 0);
    bg.setAttribute("y", 0);
    bg.setAttribute("width", W);
    bg.setAttribute("height", H);
    bg.setAttribute("fill", "white");

    let rays = document.createElementNS(ns, "g");
    rays.appendChild(bg);
    rays.setAttribute("id", "rays");
    rays.setAttribute("style", `stroke-linejoin:bevel; fill:none; stroke-width:${S}; stroke:black;`);
    svg.appendChild(rays);

    let polyshapes = paramsToShapes()
    if (uBB != '') {
        parseBBox(uBB).map(p => polyshapes.push(p.shape))
    }

    polyshapes.map((p) => {
        let path = p
        if (!path || !path.length) return
        let newPath = document.createElementNS(ns, "path");
        let d = `M ${path[0].x} ${path[0].y} `;
        for (let i = 1; i < path.length; i++) {
            d += `L ${path[i].x} ${path[i].y} `;
        }
        newPath.setAttribute("d", d);
        rays.appendChild(newPath);
    });

    return svg;
}

function saveMySVG() {
    let name = `lightbreak-${parseInt(tokenData.tokenId) % 1000000}.svg` //-${tokenData.tokenId}
    saving = true
    let svgcanvas = createSVGCanvas()
    saveSVGElement(svgcanvas, name)
    saving = false
}

function paramsToShapes() {
    let rays = []
    allParams.map(param => {
        if (param.n == 2) {
            let [r1, r2] = param.oldrays
            let newshape = [...r1.shape.reverse(), ...r2.shape]
            rays.push(newshape)
        } else {
            rays.push(...param.oldrays.map(p => p.shape))
        }
    })
    return [...rays, mousePoly.shape]
}

class GridQT {
    constructor(x, y, w, h, gap) {
        this.x = x
        this.y = y
        this.width = w
        this.height = h
        this.gap = gap
        this.grid = []
        this.allCells = []
        for (let i = 0; i < this.width / gap; i++) {
            this.grid.push([])
            for (let j = 0; j < this.height / gap; j++) {
                let cell = {}
                cell.i = i
                cell.j = j
                // cell.bbox = Poly.rect(i * gap + gap / 2, j * gap + gap / 2, gap, gap)
                cell.polys = []
                this.grid[i].push(cell)
                this.allCells.push(cell)
            }
        }
        this.allPolys = []
    }

    add(poly, p2 = undefined) {
        if (p2 == undefined) {
            this.allPolys.push(poly)
        } else {
            this.allPolys.push({ p1: poly, p2 })
        }
        // if it's an array
        if (poly.length) {
            poly.map(p => this.add(p))
            return
        }
        // if it's a single poly)
        if (poly.shape && !p2) {
            for (let i = 0; i < poly.shape.length - 1 + poly.closed; i++) {
                let p1 = poly.shape[i]
                let p2 = poly.shape[(i + 1) % poly.shape.length]
                let cells = this.getLineCells(p1, p2)
                cells.map((cell, i) => {
                    cell.polys.push({ p1, p2 })
                    // stroke(i / cells.length * 255)
                    // cell.bbox.draw()
                })
            }
            return
        }
        // if it's a line
        let p1 = poly
        let cells = this.getLineCells(p1, p2)
        cells.map((cell, i) => {
            cell.polys.push({ p1, p2 })
        })
    }

    rayIntersect(p1, p2) {
        p2 = p2.copy()
        p2.setMag(W + H)
        p2 = p5.Vector.add(p1, p2)
        let [cells, xFlip, steep] = this.getLineCells(p1, p2, 1)
        let counter = 2
        let beginCountingDown = false
        let intersections = []
        for (let cell of cells) {
            // push()
            // colorMode(HSB)
            // stroke(counter++, 100, 100)
            // if (steep) {
            //     strokeWeight(3)
            // } else {
            //     strokeWeight(1)
            // }
            // if (xFlip) {
            //     fill(10, 0, 0, 0.2)
            // } else {
            //     noFill()
            // }
            // cell.bbox.draw()
            // pop()
            for (let l of cell.polys) {
                let intersection = this.rayToLineSegmentIntersection(p1, p2, l.p1, l.p2)
                if (intersection &&
                    intersection.point.x >= cell.i * this.gap &&
                    intersection.point.x <= (cell.i + 1) * this.gap
                    && intersection.point.y >= cell.j * this.gap &&
                    intersection.point.y <= (cell.j + 1) * this.gap) {
                    intersections.push(intersection)
                }
            }
            if (intersections.length) {
                beginCountingDown = true
            }
            if (beginCountingDown && --counter <= 0) break
        }
        intersections.sort((a, b) => a.t - b.t)
        let first = intersections[0]
        if (first == undefined) return //print(first)
        // print((p1.x - first.point.x) ** 2 + (p1.y - first.point.y) ** 2)
        if (((p1.x - first.point.x) ** 2 + (p1.y - first.point.y) ** 2) > S * 10) {
            return intersections[0]
        }
        return false
    }

    getLineCells(p0, p1, cellWidth = this.gap, cellHeight = this.gap, totalWidth = this.width, totalHeight = this.height) {
        let data = 0
        if (cellWidth == 1) {
            data = 1
            cellWidth = this.gap
        }
        let x0 = p0.x / cellWidth - 0.5
        let y0 = p0.y / cellHeight - 0.5
        let x1 = p1.x / cellWidth - 0.5
        let y1 = p1.y / cellHeight - 0.5

        const round = x => Math.floor(x + 0.5);

        let cells = [];
        let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);

        if (steep) {
            [x0, y0] = [y0, x0];
            [x1, y1] = [y1, x1];
        }
        if (x0 > x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x1 - x0;
        const dy = y1 - y0;
        const slope = dx === 0 ? 1 : dy / dx;

        const addCell = (x, y) => {
            if (steep) {
                cells.push({ x: y, y: x });
            } else {
                cells.push({ x, y });
            }
        };

        const xEnd = round(x0);
        const yEnd = y0 + slope * (xEnd - x0);

        const xpxl1 = xEnd;
        const ypxl1 = Math.floor(yEnd);

        addCell(xpxl1, ypxl1);
        addCell(xpxl1, ypxl1 + 1);
        let intery = yEnd + slope;

        const xpxl2 = round(x1);
        const ypxl2 = Math.floor(y1 + slope * (xpxl2 - x1));

        for (let x = xpxl1 + 1; x <= xpxl2 - 1; x++) {
            addCell(x, Math.floor(intery));
            addCell(x, Math.floor(intery) + 1);
            intery += slope;
        }

        addCell(xpxl2, ypxl2);
        addCell(xpxl2, ypxl2 + 1);

        if (p0.x >= p1.x) {
            cells.reverse();
        }
        if (steep && p0.x > p1.x && p0.y < p1.y || steep && p0.x < p1.x && p0.y > p1.y) {
            cells.reverse();
        }

        let finalCells = []
        for (let i = 0; i < cells.length; i++) {
            let cell = cells[i];
            cell.x = Math.floor(cell.x);
            cell.y = Math.floor(cell.y);
            if (cell.x >= 0 && cell.y >= 0 && cell.x < this.grid.length && cell.y < this.grid[0].length) {
                finalCells.push(this.grid[cell.x][cell.y]);
            }
        }

        if (data) return [finalCells, p0.x > p1.x, steep]
        return finalCells;
    }

    // getLineCells(p0, p1, cellWidth = this.gap, cellHeight = this.gap, totalWidth = this.width, totalHeight = this.height) {
    //     let cells = []
    //     for (let cell of this.allCells) {
    //         let p = cell.bbox
    //         if (p.overlaps(new Poly([p0, p1]), 1)) {
    //             cells.push(cell)
    //         }
    //     }
    //     return cells
    // }

    rayToLineSegmentIntersection(l0p0, l0p1, l1p0, l1p1) {
        let l0dx = l0p1.x - l0p0.x;
        let l0dy = l0p1.y - l0p0.y;
        let l1dx = l1p1.x - l1p0.x;
        let l1dy = l1p1.y - l1p0.y;

        let denom = l1dy * l0dx - l1dx * l0dy;
        let nume_a = l1dx * (l0p0.y - l1p0.y) - l1dy * (l0p0.x - l1p0.x);
        let nume_b = l0dx * (l0p0.y - l1p0.y) - l0dy * (l0p0.x - l1p0.x);

        if (denom == 0) {
            if (nume_a == 0 && nume_b == 0) {
                // Collinear
                // return l0p0;
                return undefined
            }
            // Parallel
            return undefined;
        }

        let u_a = nume_a / denom;
        let u_b = nume_b / denom;

        let EPS = 0.00000001
        if (u_a >= EPS && u_b >= EPS && u_b <= 1 - EPS) {
            return {
                point: createVector(l0p0.x + u_a * l0dx, l0p0.y + u_a * l0dy),
                t: u_a,
                dir: p5.Vector.sub(l1p1, l1p0)
            }
        }
        return undefined;
    }

    // draw(all = false) {
    //     for (let cell of this.allCells) {
    //         if (all || cell.polys.length) {
    //             cell.bbox.draw()
    //         }
    //     }
    // }
}



let R, rnd, rint, choice, sn, rexp, rtri, wPick;
function setupRandom() {
    R = new Random()
    randomSeed(R.random_int(0, 1e16))
    noiseSeed(R.random_int(0, 1e16))
    rnd = (a, b) => {
        if (a instanceof Array) {
            return R.random_choice(a)
        } else if (a === undefined) {
            return R.random_dec()
        } else if (b === undefined) {
            return R.random_num(0, a)
        } else {
            return R.random_num(a, b)
        }
    }
    // rint = (a, b) => {
    //     if (b === undefined) {
    //         return R.random_int(0, a)
    //     } else {
    //         return R.random_int(a, b)
    //     }
    // }
    // choice = (arr) => {
    //     return R.random_choice(arr)
    // }
    // sn = (x, y, z) => {
    //     return map(noise(x, y, z), 0, 1, -1, 1)
    // }
    // rexp = (a, b, c = 0.2) => {
    //     let off = b ? a : 0
    //     let mult = off ? b - a : a
    //     return (1 - Math.pow(rnd(), c)) * mult + off
    // }
    rtri = (a, c, b) => {
        let r = R.random_dec()
        if (r < 0.5) return map(r, 0, 0.5, a, c)
        else return map(r, 0.5, 1, c, b)
        // let F = (c - a) / (b - a);
        // let r = rnd();
        // // let r= u
        // if (r < F) {
        //     return a + Math.sqrt(r * (b - a) * (c - a));
        // } else {
        //     return b - Math.sqrt((1 - r) * (b - a) * (b - c));
        // }
    }
    weightedPick = (picked, weights) => {
        let i;
        for (i = 0; i < weights.length; i++) weights[i] += weights[i - 1] || 0;
        var e = rnd() * weights[weights.length - 1];
        for (i = 0; i < weights.length && !(weights[i] >= e); i++);
        return picked[i];
    }
}

class Random {
    constructor() {
        this.useA = false;
        let sfc32 = function (uint128Hex) {
            let a = parseInt(uint128Hex.substr(0, 8), 16);
            let b = parseInt(uint128Hex.substr(8, 8), 16);
            let c = parseInt(uint128Hex.substr(16, 8), 16);
            let d = parseInt(uint128Hex.substr(24, 8), 16);
            return function () {
                a |= 0; b |= 0; c |= 0; d |= 0;
                let t = (((a + b) | 0) + d) | 0;
                d = (d + 1) | 0;
                a = b ^ (b >>> 9);
                b = (c + (c << 3)) | 0;
                c = (c << 21) | (c >>> 11);
                c = (c + t) | 0;
                return (t >>> 0) / 4294967296;
            };
        };
        if (tokenData.hash == "") {
            let rndHash = () => {
                let letters = '0123456789abcdef'
                let hash = '0x'
                for (let i = 0; i < 64; i++) { hash += letters[Math.floor(Math.random() * letters.length)] }
                return hash
            }
            tokenData.hash = rndHash()
        }
        // seed prngA with first half of tokenData.hash
        this.prngA = new sfc32(tokenData.hash.substr(2, 32));
        // seed prngB with second half of tokenData.hash
        this.prngB = new sfc32(tokenData.hash.substr(34, 32));
        for (let i = 0; i < 1e6; i += 2) {
            this.prngA();
            this.prngB();
        }
    }
    // random number between 0 (inclusive) and 1 (exclusive)
    random_dec() {
        this.useA = !this.useA;
        return this.useA ? this.prngA() : this.prngB();
    }
    // random number between a (inclusive) and b (exclusive)
    random_num(a, b) {
        return a + (b - a) * this.random_dec();
    }
    // random integer between a (inclusive) and b (inclusive)
    // requires a < b for proper probability distribution
    random_int(a, b) {
        return Math.floor(this.random_num(a, b + 1));
    }
    // random boolean with p as percent liklihood of true
    random_bool(p) {
        return this.random_dec() < p;
    }
    // random value in an array of items
    random_choice(list) {
        return list[this.random_int(0, list.length - 1)];
    }
}

let vec, rndvec
let W, H
p5.disableFriendlyErrors = true

function setupUseful() {
    setupRandom()
    W = width
    H = height
    vec = createVector
    rndvec = (a = 0, b = W, c = 0, d = H) => vec(rnd(a, b), rnd(c, d))
}

// saveNamed()
// setTimeout(window.location.reload.bind(window.location), 5000)

function saveNamed() {
    save(`lightbreak-${parseInt(tokenData.tokenId) % 1000000}.png`)
}


function distSq(p1, p2) {
    return p5.Vector.sub(p1, p2).magSq()
}

// function distManhattan(p1, p2) {
//     return abs(p1.x - p2.x) + abs(p1.y - p2.y)
// }


class Poly {
    //https://editor.p5js.org/amygoodchild/sketches/L7X-WH6X0
    constructor(shape, x = 0, y = 0, s = 1, r = 0, closed = true, c = undefined, sc = undefined) {
        // let settings = defaults({
        //     shape: [],
        //     x: 0,
        //     y: 0,
        //     s: 1,
        //     r: 0,
        //     breaks: [],
        // }, arguments)
        this.shape = shape.map((rv) => {
            return vec(
                x + rv.x * s,
                y + rv.y * s
            )
        })
        this.closed = closed
        this.findBBox()

        this.c = c
        this.sc = sc
    }


    rayIntersect(polys, dir, tMin = 1) {
        let p1 = this.shape[this.shape.length - 1]
        let p2 = p5.Vector.add(p1, dir)
        let intersections = []

        polys.map(poly => {
            // if (poly.shape.length < 2) return
            for (let i = 0; i < poly.shape.length - 1; i++) {
                let p3 = poly.shape[i]
                let p4 = poly.shape[(i + 1) % poly.shape.length]
                let intersection = this.rayToLineSegmentIntersection(p1, p2, p3, p4)
                if (intersection) {
                    intersections.push(intersection)
                }
            }
        })

        intersections.sort((a, b) => a.t - b.t)

        // print(intersections)

        if (intersections.length && intersections[0].t > tMin) return intersections[0]
    }

    // rayToLineSegmentIntersection(l0p0, l0p1, l1p0, l1p1) {
    //     let l0dx = l0p1.x - l0p0.x;
    //     let l0dy = l0p1.y - l0p0.y;
    //     let l1dx = l1p1.x - l1p0.x;
    //     let l1dy = l1p1.y - l1p0.y;

    //     let denom = l1dy * l0dx - l1dx * l0dy;
    //     let nume_a = l1dx * (l0p0.y - l1p0.y) - l1dy * (l0p0.x - l1p0.x);
    //     let nume_b = l0dx * (l0p0.y - l1p0.y) - l0dy * (l0p0.x - l1p0.x);

    //     if (denom == 0) {
    //         if (nume_a == 0 && nume_b == 0) {
    //             // Collinear
    //             // return l0p0;
    //             return undefined
    //         }
    //         // Parallel
    //         return undefined;
    //     }

    //     let u_a = nume_a / denom;
    //     let u_b = nume_b / denom;

    //     let EPS = 0.000001
    //     if (u_a >= EPS && u_b >= EPS && u_b <= 1 - EPS) { //&& u_a = 1 + EPS
    //         return {
    //             point: createVector(l0p0.x + u_a * l0dx, l0p0.y + u_a * l0dy),
    //             t: u_a,
    //             dir: p5.Vector.sub(l1p1, l1p0)
    //         }
    //     }
    //     return undefined;
    // }

    addPoint(p, addToQT = true) {
        this.shape.push(p)
        // this.findBBox()
        if (addToQT) {
            qt.add(this.shape[this.shape.length - 2], this.shape[this.shape.length - 1])
        }
    }

    static rect(x, y, w, h) {
        w /= 2
        h /= 2
        let eps = 0.000001
        let shape = [
            vec(x - w, y - h),
            vec(x + w, y - h),
            vec(x + w + eps, y + h),
            vec(x - w - eps, y + h)
        ]
        let poly = new Poly(shape)
        return poly
    }


    // restructure(tol = 0.12, alsoReseed = 5) {
    //     let shape = [this.shape[0]]
    //     for (let i = 0; i < this.shape.length - 1; i++) {
    //         let ip = (i + 1) % this.shape.length
    //         let ipp = (i + 2) % this.shape.length
    //         let p0 = shape[shape.length - 1]
    //         let p1 = this.shape[ip]
    //         let p2 = this.shape[ipp]
    //         let v0 = p5.Vector.sub(p1, p0)
    //         let v1 = p5.Vector.sub(p2, p1)
    //         if (abs(v0.angleBetween(v1)) > tol)
    //             shape.push(p1)
    //     }
    //     this.shape = shape
    //     if (alsoReseed)
    //         this.reseed(alsoReseed)
    //     return this
    // }


    // copy(x = undefined, y = undefined, s = 1, c = undefined, sc = undefined) {
    //     x = x ?? 0
    //     y = y ?? 0
    //     s = s ?? 1
    //     c = c ?? this.c
    //     sc = sc ?? this.sc
    //     return new Poly(this.shape, x, y, s, 0, this.closed, c, sc)
    // }

    setColor(c = undefined, sc = undefined) {
        this.c = c
        this.sc = sc
        return this
    }


    // onCanvas(lm = 0, rm = width, tm = 0, bm = height) {
    //     return (this.bbl > lm &&
    //         this.bbr < rm &&
    //         this.bbt > tm &&
    //         this.bbb < bm)
    // }

    // // Checks if two lines intersect using method explained here - 
    // // https://stackoverflow.com/a/30160064
    // static intersect(line0p0, line0p1, line1p0, line1p1) {
    //     // Finds direction (clockwise or anti) of point in relation to line
    //     let isClockwiseFromLine = (linep0, linep1, p) => {
    //         let vec1 = p5.Vector.sub(linep0, linep1);
    //         let vec2 = p5.Vector.sub(p, linep1);
    //         let a = vec1.angleBetween(vec2);
    //         return (a < 0)
    //     }

    //     let line0dir0 = isClockwiseFromLine(line0p0, line0p1, line1p0);
    //     let line0dir1 = isClockwiseFromLine(line0p0, line0p1, line1p1);

    //     if (line0dir0 != line0dir1) {
    //         let line1dir0 = isClockwiseFromLine(line1p0, line1p1, line0p0);
    //         let line1dir1 = isClockwiseFromLine(line1p0, line1p1, line0p1);
    //         return line1dir0 != line1dir1
    //     }
    //     return false;
    // }

    findBBox() {
        this.bbl = 999999;
        this.bbr = -999999;
        this.bbt = 999999;
        this.bbb = -999999;

        for (let p of this.shape) {
            if (p.x < this.bbl) this.bbl = p.x;
            if (p.x > this.bbr) this.bbr = p.x;
            if (p.y < this.bbt) this.bbt = p.y;
            if (p.y > this.bbb) this.bbb = p.y;
        }
    }

    // BBoxOverlap(poly) {
    //     return (this.bbr > poly.bbl && this.bbb > poly.bbt) &&
    //         (this.bbr > poly.bbl && this.bbt < poly.bbb) &&
    //         (this.bbl < poly.bbr && this.bbb > poly.bbt) &&
    //         (this.bbl < poly.bbr && this.bbt < poly.bbb)

    // }


    // contains(p) {
    //     // Check if the dot is roughly in the region 
    //     if (p.x < this.bbl || p.x > this.bbr
    //         || p.y < this.bbt || p.y > this.bbb) {
    //         return false;
    //     }

    //     // Create dot2 as the other end of the imaginary horizontal line extending off edge of canvas
    //     let off = vec(999999, p.y);
    //     // Check each line around this polygon, and count up the number of intersects
    //     let intersections = 0;
    //     this.shape.map((_, i) => {
    //         let j = (i + 1) % this.shape.length;
    //         intersections += Poly.intersect(p, off, this.shape[i], this.shape[j]);
    //     })

    //     // If it's even, the dot is outside
    //     // stroke(intersections % 2 * 255, 0, 0)
    //     // circle(p.x, p.y, 20)
    //     return !(intersections % 2 == 0)
    // }

    // overlaps(poly, andNotInside = false) {
    //     if (!this.BBoxOverlap(poly)) return false

    //     for (let i = 0; i < this.shape.length; i++) {
    //         let j = (i + 1) % this.shape.length;
    //         for (let k = 0; k < poly.shape.length; k++) {
    //             let l = (k + 1) % poly.shape.length;
    //             if (Poly.intersect(
    //                 this.shape[i],
    //                 this.shape[j],
    //                 poly.shape[k],
    //                 poly.shape[l]))
    //                 return true
    //         }
    //     }
    //     if (andNotInside) {
    //         return poly.contains(this.shape[0]) || this.contains(poly.shape[0])
    //     }
    //     return false
    // }

    // // checks if poly overlaps with canvas or an array of polys
    // overlapsAny(polys, andNotOnCanvas = true, andNotInside = true) {
    //     return (andNotOnCanvas && !this.onCanvas()) || polys.reduce((canPack, poly2) => {
    //         return canPack || this.overlaps(poly2, andNotInside)
    //     }, false)
    // }

    addToQT() {
        this.qt = new QT(new BB((this.bbl + this.bbr) / 2,
            (this.bbb + this.bbt) / 2,
            (this.bbr - this.bbl) / 2,
            (this.bbb - this.bbt) / 2), 4)
        this.qt.show()
        for (let i = 0; i < this.shape.length; i++) {
            let ip = (i + 1 + this.shape.length) % this.shape.length
            let p1 = this.shape[i]
            let p2 = this.shape[ip]
            this.qt.insert({
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y
            })
        }
    }

    reseed(gap = 5, closed = true) {
        let shape = []
        for (let i = 0; i < this.shape.length; i++) {
            if (!closed && i == this.shape.length - 1) break
            let ip = (i + 1) % this.shape.length
            let v1 = this.shape[i]
            let v2 = this.shape[ip]
            let d = p5.Vector.dist(v1, v2)
            let percent = gap / d
            shape.push(v1)
            if (percent < 1) {
                if (percent > 0.5) {
                    shape.push(p5.Vector.lerp(v1, v2, 0.5))
                } else
                    for (let j = percent; j < 1; j += percent) {
                        shape.push(p5.Vector.lerp(v1, v2, j))
                    }
            }
        }
        this.shape = shape
        return this
    }

    draw(withOutline = true, withFills = false, smooth = false) {
        noFill()
        if (this.sc) stroke(this.sc)
        if (this.c == 255) fill(this.c)
        if (withOutline) {
            beginShape()
            this.shape.map((v, i) => {
                if (smooth) curveVertex(v.x, v.y)
                else vertex(v.x, v.y)
            })
            if (this.closed)
                endShape(CLOSE)
            else
                endShape()
        }
    }

}



async function getPolysFromSVG(filename) {
    const response = await fetch(filename);
    const svgContent = await response.text();

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const elements = svgDoc.querySelectorAll('path, polygon, line');
    const paths = [];

    for (const element of elements) {
        let polyline = [];
        if (element.tagName === 'path') {
            const d = element.getAttribute('d');
            polyline = pathDataToPolyline(d);
        } else if (element.tagName === 'polygon') {
            const points = element.getAttribute('points');
            polyline = pointsToPolyline(points);
        } else if (element.tagName === 'line') {
            const x1 = parseFloat(element.getAttribute('x1'));
            const y1 = parseFloat(element.getAttribute('y1'));
            const x2 = parseFloat(element.getAttribute('x2'));
            const y2 = parseFloat(element.getAttribute('y2'));
            polyline = [[x1, y1], [x2, y2]];
        }

        const style = element.getAttribute('style') || '';
        const styleObj = style.split(';').reduce((acc, curr) => {
            const [key, value] = curr.split(':');
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {});

        const stroke = element.getAttribute('stroke') || styleObj.stroke || 'black';
        const fill = element.getAttribute('fill') || styleObj.fill || 'none';
        const strokeWidth = parseFloat(element.getAttribute('stroke-width')) || parseFloat(styleObj['stroke-width']) || 1;

        paths.push({ polyline, stroke, strokeWidth, fill });
    }

    return paths.map(p => {
        let poly = new Poly(p.polyline.map(a => vec(a[0], a[1])), 0, 0, 1, 0, 0, undefined, p.stroke);
        return poly;
    });
}



function pointsToPolyline(points) {
    return points
        .trim()
        .split(/\s+|,/)
        .map(Number)
        .reduce((acc, val, idx, arr) => {
            if (idx % 2 === 0) {
                acc.push([arr[idx], arr[idx + 1]]);
            }
            return acc;
        }, []);
}


function pathDataToPolyline(d) {
    // A simple path data to polyline converter
    const pathCommands = d.match(/([A-Za-z]|[+-]?[0-9]+(\.[0-9]+)?)/g);
    const polyline = [];

    let x = 0, y = 0;

    for (let i = 0; i < pathCommands.length; i++) {
        const command = pathCommands[i];

        if (command === 'M' || command === 'm') {
            x = parseFloat(pathCommands[++i]);
            y = parseFloat(pathCommands[++i]);
            polyline.push([x, y]);
        } else if (command === 'L' || command === 'l') {
            x = command === 'L' ? parseFloat(pathCommands[++i]) : x + parseFloat(pathCommands[++i]);
            y = command === 'L' ? parseFloat(pathCommands[++i]) : y + parseFloat(pathCommands[++i]);
            polyline.push([x, y]);
        }
        // You can add more command handling for other commands, such as 'C', 'S', 'Q', 'T', 'A', 'Z', etc.
    }

    return polyline;
}