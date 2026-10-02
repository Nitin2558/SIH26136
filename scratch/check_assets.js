async function testAssets() {
  const html = await (await fetch('http://localhost:5000/')).text();
  const matchJs = html.match(/src=["'](\/assets\/[^"']+)["']/);
  const matchCss = html.match(/href=["'](\/assets\/[^"']+)["']/);
  if (matchJs) {
    const res = await fetch('http://localhost:5000' + matchJs[1]);
    console.log('JS Bundle (' + matchJs[1] + ') -> Status ' + res.status + ' (' + (await res.text()).length + ' bytes)');
  }
  if (matchCss) {
    const res = await fetch('http://localhost:5000' + matchCss[1]);
    console.log('CSS Bundle (' + matchCss[1] + ') -> Status ' + res.status + ' (' + (await res.text()).length + ' bytes)');
  }
}
testAssets();
