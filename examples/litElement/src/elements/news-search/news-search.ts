import { LitElement, html, customElement, css, property } from "lit-element";

declare global {
    interface Window { colibo: any; }
}

@customElement("example-news-search")
export class NewsSearchElement extends LitElement {
    static styles = css`
        :host {
            display:block;
            font-family: var(--colibo-font-family);
            line-height: var(--colibo-line-height);
            padding-top:var(--colibo-padding);
        }
        h1, h3 {
            font-size:var(--colibo-header-font-size);
            color: var(--colibo-primary-color);
            margin-top:0;
        }
        ul, li {
            margin:0;
            padding:0;
            list-style:none;
        }
        a {
            display:block;
            color: black;
            text-decoration:none;
            margin-bottom:var(--colibo-padding);
        }
        a.res:hover {
            background:rgba(var(--primary-r), var(--primary-g), var(--primary-b), 0.05);
        }
        a.refine:hover {
            text-decoration:underline;
        }
        a strong {
            color:var(--colibo-primary-color);
            display:block;
        }
        a span {
            display:block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size:10px;
            color:#999;
        }
    `;

    @property() configuration: any;

    @property() results: any[] = [];

    private get = window['colibo'].helpers 
        ? window['colibo'].helpers.http.get
        : (url: string) => window.fetch(url).then(res=>res.json());

    get tabName() {
        return 'News';
    };

    searching = false;
    simpleMode = false;

    clear() {
        this.searching = false;
        this.results = [];
    }

    word: string;

    async search(word: string) {
        this.searching = true;

        this.word = word;

        if(!word) {
            this.results = [];
            this.searching = false;
            return '0';
        }

        return this.get(`https://newsapi.org/v2/everything?q=${word}&sortBy=publishedAt&apiKey=${this.configuration.apiKey}`)
            .then((res: any) => {
                this.results = res.articles;
                return res.totalResults;
            });
    }

    render() {
        const { results } = this;
        return html`
            ${
                this.searching 
                ? html`
                        ${
                            (this.results && this.results.length)
                                ? html`<ul>
                                    ${this.results.map(res=>html`
                                        <li>
                                            <a href="${res.url}" class="res" target="_blank" noopener>
                                                <strong>${res.title}</strong>
                                                ${res.description}
                                                <span>${res.url}</span>
                                            </a>
                                        </li>
                                    `)}
                                </ul>
                                
                                `
                                : html`No results from NewsApi.org`
                        }
                    </ul>`
                : null
            }
        `;
    }
}