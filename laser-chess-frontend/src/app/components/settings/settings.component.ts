import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Settings } from 'src/app/app.models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  animation = false
  sound = false
  userSettings: Settings | undefined
  constructor (private userService: UserService) { }

  ngOnInit() {
    this.userService.getSettings().toPromise().then(settings=> {
      this.userSettings = settings
      this.animation = settings.skip_animations
      this.sound = settings.sound_on
    })
  }
  changeAnimationShowOption(){
    if (this.userSettings){
      if (this.userSettings.skip_animations == true)
        this.userSettings.skip_animations = false
      else
        this.userSettings.skip_animations = true
      !this.animation
      this.userService.updateSettings(this.userSettings)
    }
  }

  changeSoundOption(){
    if (this.userSettings){
      if (this.userSettings.sound_on == true)
        this.userSettings.sound_on = false
      else
        this.userSettings.sound_on = true
      !this.sound
      this.userService.updateSettings(this.userSettings)
    }
  }
}
