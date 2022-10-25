// import $ from 'jquery';
// import $ = require("jquery")

class Region {
    min_width: number = 0;
    max_width: number = 100;
    min_height: number = 0;
    max_height: number = 100;
}

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

class Style {
    background: Color = 'rgb(255, 255, 255)';
    border: string = "none";
    suggestion: boolean = false;
    constructor() {

    }
}

function random_color(): Color {
    return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}

function color_from(r: number, g: number, b: number): Color {
    return `rgb(${r}, ${g}, ${b})`;
}

function generate_style(style: Style, region: Region): string {
    let width = region.max_width - region.min_width;
    let height = region.max_height - region.min_height;
    let margin_left = region.min_width;
    let margin_top = region.min_height;
    let flex = width >= height ? height : width;
    let flex_direction = style.suggestion ? "column" : "row";

    let style_source = `
    background-color: ${style.background};
    width: ${width}%;
    height: ${height}%;
    /*margin-left: ${margin_left}%;*/
    /*margin-top: ${margin_top}%;*/
    display: flex;
    flex: ${flex};
    flex-direction: ${flex_direction};
    `;
    if (style.border !== "none") style_source += `border:${style.border}`;
    return style_source;
}

function generate_html_element(token: string, id: string, region: Region, style: Style): string {
    let style_string = generate_style(style, region);
    return `<${token} id=${id} style="${style_string}"></${token}>`;
}

class Block {
    parent?: Block;
    id: string;
    nodes: Block[] = [];
    region: Region;
    style: Style = new Style();
    constructor(parent?: Block, region?: Region, identifier?: number, suggestion?: boolean) {
        this.parent = parent;
        this.region = region ? region : new Region();
        if (parent) {
            this.id = parent.id + "_" + identifier?.toString();
        } else {
            this.id = "body_root";
        }
        this.style.suggestion = suggestion as boolean;
    }
    split_horizontal(...percents: number[]) {
        percents.sort();
        let prev_max_height: number = 0;
        percents.forEach((element, index) => {
            let region = new Region();
            region.min_height = prev_max_height;
            region.max_height = element;
            this.nodes.push(new Block(this, region, index));
            prev_max_height = element;
        });
        let last_region: Region = new Region();
        last_region.min_height = prev_max_height;
        this.nodes.push(new Block(this, last_region, percents.length, true));
        this.style.suggestion = true;
    }
    split_vertical(...percents: number[]) {
        percents.sort();
        let prev_max_width: number = 0;
        percents.forEach((element, index) => {
            let region = new Region();
            region.min_width = prev_max_width;
            region.max_width = element;
            this.nodes.push(new Block(this, region, index));
            prev_max_width = element;
        });
        let last_region: Region = new Region();
        last_region.min_width = prev_max_width;
        this.nodes.push(new Block(this, last_region, percents.length));
        this.style.suggestion = false;
    }
    has_nodes(): boolean {
        return this.nodes.length > 0;
    }
    debug() {
        console.log("length: " + this.nodes.length + " width: " + (this.region.max_width-this.region.min_width) + " height: " + (this.region.max_height-this.region.min_height));
    }
    randomize_backgrounds() {
        this.nodes.forEach(element => {
            element.style.background = random_color();
        });
    }
    parse() {
        let parent_node = this.parent ? $('#' + this.parent?.id) : $('body');
        parent_node.append(generate_html_element("div", this.id, this.region, this.style));
        this.nodes.forEach(element => {
            element.parse();
        });
    }
}

function run() {
    var root = new Block();
    root.split_horizontal(10, 90);
    root.randomize_backgrounds();

    root.nodes[1].split_vertical(15, 85);
    root.nodes[1].randomize_backgrounds();

    root.parse();

    // Insert iframe
    // let ifaarm_style = new Style();
    // ifaarm_style.background = color_from(255, 255, 255);
    // let ifaarm_source = generate_html_element("iframe", "ifaarm", new Region(), ifaarm_style );
    // $("#body_root_1_1").html(ifaarm_source);
    // $("#ifaarm").attr("src", "https://www.youtube.com/embed/18VM1xZQdXc");
    // $("#ifaarm").attr("frameborder", "0");
    let canvas_style = new Style();
    let canvas_src = generate_html_element("canvas", "canvas", new Region(), canvas_style);
    let container_src = '<div id="wasm-example"></div>'
    $("#body_root_1_1").html(container_src);
    // $("canvas").attr("width", 400);
    // $("canvas").attr("height", 320);

}

jQuery(run);
