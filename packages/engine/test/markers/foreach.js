import { define } from '@hybrids/core';
import engine from '../../src/engine';
import { getOwnLocals } from '../../src/expression';

describe('foreach marker', () => {
  let el;

  function extractValues() {
    return Array.from(el.shadowRoot.querySelectorAll('[data-value]')).map(
      node => Number(node.textContent)
    );
  }

  afterEach(() => {
    document.body.removeChild(el);
  });

  describe('one instance', () => {
    class EngineForeachTest {
      static get options() {
        return {
          use: [engine],
          properties: ['items'],
          template: `
            <template [*foreach]="items">
              <div [text-content]="@item" data-value hidden></div>
              <span hidden>test</span>
            </template>
          `
        };
      }

      constructor() {
        this.items = [4, 2, 3, 1];
      }
    }

    define({ EngineForeachTest });

    beforeEach(() => {
      el = document.createElement('engine-foreach-test');
      document.body.appendChild(el);
    });

    it('initial items list', () => {
      expect(extractValues()).toEqual([4, 2, 3, 1]);
    });

    it('initial locals', () => {
      expect(getOwnLocals(el.shadowRoot.children[1])).toEqual({
        number: 1,
        first: true,
        last: false,
        odd: true,
        even: false,
        item: 4,
        index: 0,
        length: 4,
        key: '0',
      });
      expect(getOwnLocals(el.shadowRoot.children[3])).toEqual({
        number: 2,
        first: false,
        last: false,
        odd: false,
        even: true,
        item: 2,
        index: 1,
        length: 4,
        key: '1',
      });
    });

    it('shift item locals', (done) => {
      el.items.shift();
      window.requestAnimationFrame(() => {
        expect(getOwnLocals(el.shadowRoot.children[1])).toEqual({
          number: 1,
          first: true,
          last: false,
          odd: true,
          even: false,
          item: 2,
          index: 0,
          length: 3,
          key: '0',
        });
        expect(getOwnLocals(el.shadowRoot.children[3])).toEqual({
          number: 2,
          first: false,
          last: false,
          odd: false,
          even: true,
          item: 3,
          index: 1,
          length: 3,
          key: '1',
        });
        done();
      });
    });

    it('pop item', (done) => {
      el.items.pop();
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([4, 2, 3]);
        done();
      });
    });

    it('shift item', (done) => {
      el.items.shift();
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([2, 3, 1]);
        done();
      });
    });

    it('unshift item', (done) => {
      el.items.unshift(6);
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([6, 4, 2, 3, 1]);
        done();
      });
    });

    it('sort item', (done) => {
      el.items.sort();
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([1, 2, 3, 4]);
        done();
      });
    });

    it('replace', (done) => {
      el.items = [2, 2, 1];
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([2, 2, 1]);
        done();
      });
    });

    it('empty with length', (done) => {
      el.items.length = 0;
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([]);
        done();
      });
    });

    it('push items', (done) => {
      el.items.push(1, 2, 3);
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([4, 2, 3, 1, 1, 2, 3]);
        done();
      });
    });

    it('multiple stage splice', (done) => {
      el.items.push(1, 2, 3);
      window.requestAnimationFrame(() => {
        el.items.splice(3, 2);

        window.requestAnimationFrame(() => {
          expect(extractValues()).toEqual([4, 2, 3, 2, 3]);
          done();
        });
      });
    });

    it('multiple stage sort', (done) => {
      el.items.push(1, 2, 3);
      window.requestAnimationFrame(() => {
        el.items.sort();

        window.requestAnimationFrame(() => {
          expect(extractValues()).toEqual([1, 1, 2, 2, 3, 3, 4]);
          done();
        });
      });
    });
  });

  describe('multiply instance', () => {
    class EngineForeachTestMultiply {
      static get options() {
        return {
          use: [engine],
          properties: ['items'],
          template: `
            <template [*foreach]="items">
              <template [*attrs]="test: @item.values[0]" [*foreach]="value: @item.values">
                <div data-value>{{ @value }}</div>
              </template>
              asd
            </template>
          `
        };
      }

      constructor() {
        this.items = [
          { values: [1, 2, 3] },
          { values: [4, 5, 6] },
          { values: [7, 8, 9] },
        ];
      }
    }

    define({ EngineForeachTestMultiply });

    beforeEach(() => {
      el = document.createElement('engine-foreach-test-multiply');
      document.body.appendChild(el);
    });

    it('render initial items', () => {
      expect(extractValues()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('pop item', (done) => {
      el.items.pop();
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([1, 2, 3, 4, 5, 6]);
        done();
      });
    });

    it('shift item', (done) => {
      el.items.shift();
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([4, 5, 6, 7, 8, 9]);
        done();
      });
    });

    it('unshift item', (done) => {
      el.items.unshift({ values: [10] });
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([10, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        done();
      });
    });

    it('sort item', (done) => {
      el.items.sort((a, b) => b.values[0] - a.values[0]);
      window.requestAnimationFrame(() => {
        expect(extractValues()).toEqual([7, 8, 9, 4, 5, 6, 1, 2, 3]);
        done();
      });
    });
  });
});