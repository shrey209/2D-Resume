import { useEffect, useRef } from "react";
import Phaser from "phaser";

const App = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    class MapScene extends Phaser.Scene {
      preload() {
        this.load.spritesheet("player", "assets/spritesheet.png", {
          frameWidth: 16,
          frameHeight: 16,
        });

        this.load.tilemapTiledJSON("map", "assets/ResumeMap2.json");
        this.load.image("Furniture 4", "assets/Furniture 4.png");
        this.load.image("Carpets 4", "assets/Carpets 4.png");
        this.load.image("4 Walls, Floor & Doors", "assets/4 Walls, Floor & Doors.png");
        this.load.image("4 BigSet", "assets/4 BigSet.png");
        this.load.image("interiors_demo", "assets/interiors_demo.png");
      }

      create() {
        const map = this.make.tilemap({ key: "map" });
        const tilesets = [
          map.addTilesetImage("Furniture 4", "Furniture 4"),
          map.addTilesetImage("Carpets 4", "Carpets 4"),
          map.addTilesetImage("4 Walls, Floor & Doors", "4 Walls, Floor & Doors"),
          map.addTilesetImage("4 BigSet", "4 BigSet"),
          map.addTilesetImage("interiors_demo", "interiors_demo"),
        ];

      
        const tileLayer = map.createLayer("Tile Layer 1", tilesets, 0, 0);
        tileLayer.setCollisionByProperty({ collides: true });

       
const boundaryLayer = map.getObjectLayer("boundary");
const boundaries = this.physics.add.staticGroup();

const graphics = this.add.graphics();
graphics.lineStyle(2, 0xff0000, 1); 

boundaryLayer.objects.forEach(obj => {
  const boundary = this.add.rectangle(
    obj.x + obj.width / 2, 
    obj.y + obj.height / 2, 
    obj.width, 
    obj.height
  );

  this.physics.add.existing(boundary, true); 
  boundaries.add(boundary);

  
  graphics.strokeRect(obj.x, obj.y, obj.width, obj.height);
});


        const spawnPoint = map.findObject("spawnpoints", obj => obj.name === "spawn");
        this.player = spawnPoint
          ? this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player")
          : this.physics.add.sprite(0, 0, "player");

        this.player.setScale(1.5); 
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, tileLayer);
        this.physics.add.collider(this.player, boundaries);
        

        const interactObjects = map.getObjectLayer("interaction")?.objects || [];
        const interactables = this.physics.add.staticGroup();
        
        interactObjects.forEach(obj => {
          const interactable = this.add.zone(obj.x, obj.y, obj.width, obj.height)
            .setOrigin(0)
            .setInteractive();
        
          this.physics.world.enable(interactable); // Required for overlap detection
          interactable.body.setAllowGravity(false);
          interactable.body.moves = false;
        
          interactable.setAlpha(0); // Hide the zone visually
        
          if (obj.name === "bed") {
            this.physics.add.overlap(this.player, interactable, this.handleGreet, null, this);
          }
        });
        
        this.physics.add.collider(this.player,interactables);

        this.anims.create({ key: "idle-down", frames: [{ key: "player", frame: 936 }] });
        this.anims.create({ key: "walk-down", frames: this.anims.generateFrameNumbers("player", { start: 936, end: 939 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: "idle-side", frames: [{ key: "player", frame: 975 }] });
        this.anims.create({ key: "walk-side", frames: this.anims.generateFrameNumbers("player", { start: 975, end: 978 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: "idle-up", frames: [{ key: "player", frame: 1014 }] });
        this.anims.create({ key: "walk-up", frames: this.anims.generateFrameNumbers("player", { start: 1014, end: 1017 }), frameRate: 8, repeat: -1 });

        this.player.play("idle-down");


        
        
        const camera = this.cameras.main;
        camera.startFollow(this.player, true);
 camera.setZoom(2); 
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cursors = this.input.keyboard.createCursorKeys();
      }
      handleGreet(player, interactable) {
        if (this.isInteracting) return; // Prevent multiple interactions at once
        this.isInteracting = true;
      
        console.log("Interaction triggered");
      
        // Box dimensions and positioning
        const boxWidth = this.cameras.main.width * 0.8;
        const boxHeight = 100;
        const boxX = (this.cameras.main.width - boxWidth) / 2;
        const boxY = this.cameras.main.height - boxHeight - 20;
      
        // Draw a white box at the bottom
        const dialogBox = this.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0xffffff)
          .setOrigin(0)
          .setScrollFactor(0)
          .setDepth(9999); // Ensure it's above everything
      
        const dialogText = this.add.text(boxX + 20, boxY + 20, "Press F to interact", {
          fontSize: "18px",
          color: "#000",
          wordWrap: { width: boxWidth - 40 },
        })
        .setScrollFactor(0)
        .setDepth(10000); // Ensure text is above the box
      
        dialogBox.setInteractive();
      
        dialogBox.on("pointerdown", () => {
          console.log("Dialog box clicked");
          dialogBox.destroy();
          dialogText.destroy();
          this.isInteracting = false;
        });
      
        this.input.keyboard.once("keydown-F", () => {
          dialogText.setText("Interacting with the bed...");
      
          setTimeout(() => {
            dialogBox.destroy();
            dialogText.destroy();
            this.isInteracting = false;
          }, 2000);
        });
      }
      
      
      

      update() {
        const speed = 100;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-speed);
          this.player.play("walk-side", true);
          this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(speed);
          this.player.play("walk-side", true);
          this.player.flipX = false;
        } else if (this.cursors.up.isDown) {
          this.player.setVelocityY(-speed);
          this.player.play("walk-up", true);
        } else if (this.cursors.down.isDown) {
          this.player.setVelocityY(speed);
          this.player.play("walk-down", true);
        } else {
          this.player.play("idle-down", true);
        }
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 1200,
      height: 600,
      parent: gameRef.current,
      physics: { default: "arcade", arcade: { debug: true } },
      scene: [MapScene],
    };

    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, []);

  return <div ref={gameRef}></div>;
};

export default App;
