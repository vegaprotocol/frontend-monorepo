import { downloadJson } from './download-json';

describe('downloadJson', () => {
  const jsonString = '{"key": "value"}';
  const proposalTitle = 'proposal-title';
  const url = 'https://example.com/file.json';
  const a = document.createElement('a');
  const appendChildMock = jest.fn();
  const removeChildMock = jest.fn();
  const clickMock = jest.fn();
  const revokeObjectURLMock = jest.fn();
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear().toString();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const formattedDateTime = `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;

  a.style.display = 'none';
  a.href = url;
  a.download = `${proposalTitle}-${formattedDateTime}.json`;
  document.body.appendChild = appendChildMock;
  document.body.removeChild = removeChildMock;
  window.URL.createObjectURL = jest.fn(() => url);
  window.URL.revokeObjectURL = revokeObjectURLMock;
  a.click = clickMock;

  it('creates and appends an anchor element', () => {
    downloadJson(jsonString, proposalTitle);
    expect(appendChildMock).toHaveBeenCalledWith(a);
  });

  it.skip('clicks the anchor element', () => {
    downloadJson(jsonString, proposalTitle);
    expect(clickMock).toHaveBeenCalledTimes(1);
  });

  it('revokes the object URL', () => {
    downloadJson(jsonString, proposalTitle);
    expect(revokeObjectURLMock).toHaveBeenCalledWith(url);
  });

  it('removes the anchor element', () => {
    downloadJson(jsonString, proposalTitle);
    expect(removeChildMock).toHaveBeenCalledWith(a);
  });
});
