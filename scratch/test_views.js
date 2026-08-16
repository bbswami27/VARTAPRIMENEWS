async function verify() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  console.log('Haryana View Present:', html.includes('id="haryana-view"'));
  console.log('Desh View Present:', html.includes('id="desh-view"'));
  console.log('Yuva View Present:', html.includes('id="yuva-view"'));
  console.log('Current Affairs View Present:', html.includes('id="currentaffairs-view"'));
  console.log('Generic View Present:', html.includes('id="generic-view"'));
}
verify();
