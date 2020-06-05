class HelloWorldElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode:'open'});
        this.classList.add('clb-widget')
        this.shadowRoot.innerHTML = `
            <h1>${this.configuration.header}</h1>
            <p>This is the barebone widget</p>
        `;
    }
}
customElements.define("example-hello-world", HelloWorldElement);