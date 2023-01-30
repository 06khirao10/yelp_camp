mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: campground.geometry.coordinates,
  zoom: 10,
});

//地図にズーム機能加える
//https://docs.mapbox.com/jp/mapbox-gl-js/example/navigation/
map.addControl(new mapboxgl.NavigationControl());

//地図のマーカーのオプションを変更できる
new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<h4>${campground.title}</h4><p>${campground.location}</p>`)
  )
  .addTo(map);
