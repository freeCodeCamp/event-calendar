export default function AddEvent() {
  return (
    <form action="/api/event" method="post">
      <div>
        <label htmlFor="name">Name: </label>
        <input type="text" name="name" id="name" required />
      </div>
      <div>
        <label htmlFor="link">Url: </label>
        <input type="url" name="link" id="link" required />
      </div>
      <div>
        <label htmlFor="date">Date: </label>
        <input type="date" name="date" id="date" required />
      </div>
      <div>
        <input type="submit" value="Submit" />
      </div>
    </form>
  );
}
