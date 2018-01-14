/**
 * Created by Yunzhe on 2018/1/11.
 */

'use strict';

// remember these initial values
var tanFOV = Math.tan( ( ( Math.PI / 180 ) * camera.fov / 2 ) );
var windowHeight = window.innerHeight;

// Board Listeners
// -----------------------------------------------------------------------------
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize( event ) {

    camera.aspect = window.innerWidth / window.innerHeight;

    // adjust the FOV
    camera.fov = ( 360 / Math.PI ) * Math.atan( tanFOV * ( window.innerHeight / windowHeight ) );

    camera.updateProjectionMatrix();
    camera.lookAt( scene.position );

    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.render( scene, camera );

}