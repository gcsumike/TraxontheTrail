CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `root`@`localhost` 
    SQL SECURITY DEFINER
VIEW `data_table` AS
    SELECT 
        `song`.`song_title` AS `song_title`,
        `song`.`genre` AS `genre`,
        `song`.`spotify_link` AS `spotify_link`,
        `song`.`youtube_link` AS `youtube_link`,
        `song`.`soundcloud_link` AS `soundcloud_link`,
        `song`.`artist` AS `artist`,
        `song`.`music_type` AS `music_type`,
        CONCAT(`candidate`.`fName`,
                ' ',
                `candidate`.`lName`) AS `candidate_name`,
        `candidate`.`party` AS `party`,
        `candidate`.`bio` AS `bio`,
        `event`.`event_title` AS `event_title`,
        `event`.`event_type` AS `event_type`,
        `event`.`city` AS `city`,
        `event`.`state` AS `state`,
        `event`.`notes` AS `notes`,
        (SELECT 
                `state`.`state_id`
            FROM
                (`state`
                JOIN `event`)
            WHERE
                (`event`.`state` = `state`.`state`)) AS `state_id`,
        `event`.`zip` AS `zip`,
        (SELECT 
                `zipcode`.`lat`
            FROM
                `zipcode`
            WHERE
                (`zipcode`.`zip` = `event`.`zip`)) AS `lat`,
        (SELECT 
                `zipcode`.`lng`
            FROM
                `zipcode`
            WHERE
                (`zipcode`.`zip` = `event`.`zip`)) AS `lng`
    FROM
        ((((`candidate`
        JOIN `song`)
        JOIN `event`)
        JOIN `zipcode`)
        JOIN `state`)